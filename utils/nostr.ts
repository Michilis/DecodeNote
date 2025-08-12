import { schnorr } from '@noble/secp256k1';
import { bech32 } from '@scure/base';
import { NostrEvent, DecodedIdentifier, ValidationResult, ParsedResult } from '../types/nostr';

export function parseInput(input: string): ParsedResult | null {
  const trimmed = input.trim();
  
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(trimmed);
    if (isValidEventStructure(parsed)) {
      return {
        type: 'event',
        data: parsed as NostrEvent
      };
    }
  } catch {
    // Not JSON, continue with other formats
  }

  // Check for bech32 identifiers
  if (trimmed.match(/^(npub|nsec|note|nevent|nprofile|naddr)1[02-9ac-hj-np-z]+$/)) {
    const decoded = decodeBech32Identifier(trimmed);
    if (decoded) {
      return {
        type: 'identifier',
        data: decoded
      };
    }
  }

  // Check for nostr: URI
  if (trimmed.startsWith('nostr:')) {
    const identifier = trimmed.substring(6);
    const decoded = decodeBech32Identifier(identifier);
    if (decoded) {
      return {
        type: 'identifier',
        data: decoded
      };
    }
  }

  // Check for raw hex event ID (64 characters)
  if (trimmed.match(/^[0-9a-f]{64}$/i)) {
    // Create a minimal event structure for hex ID
    const decoded: DecodedIdentifier = {
      type: 'note',
      data: {
        id: trimmed.toLowerCase()
      }
    };
    return {
      type: 'identifier',
      data: decoded
    };
  }

  return null;
}

function isValidEventStructure(obj: any): boolean {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.pubkey === 'string' &&
    typeof obj.created_at === 'number' &&
    typeof obj.kind === 'number' &&
    Array.isArray(obj.tags) &&
    typeof obj.content === 'string' &&
    typeof obj.sig === 'string'
  );
}

export function decodeBech32Identifier(identifier: string): DecodedIdentifier | null {
  try {
    const { prefix, words } = bech32.decode(identifier, 1023);
    const data = bech32.fromWords(words);
    
    switch (prefix) {
      case 'npub':
        return {
          type: 'npub',
          data: {
            pubkey: bytesToHex(data)
          }
        };
      
      case 'nsec':
        return {
          type: 'nsec',
          data: {
            pubkey: bytesToHex(data) // This is actually the private key
          }
        };
      
      case 'note':
        return {
          type: 'note',
          data: {
            id: bytesToHex(data)
          }
        };
      
      case 'nevent':
      case 'nprofile':
      case 'naddr':
        return decodeTLV(prefix as any, data);
      
      default:
        return null;
    }
  } catch (error) {
    console.error('Bech32 decode error:', error);
    return null;
  }
}

function decodeTLV(type: 'nevent' | 'nprofile' | 'naddr', data: Uint8Array): DecodedIdentifier {
  const result: DecodedIdentifier = {
    type,
    data: {},
    tlv: []
  };

  let offset = 0;
  while (offset < data.length) {
    const tlvType = data[offset];
    const length = data[offset + 1];
    const value = data.slice(offset + 2, offset + 2 + length);
    
    const tlvEntry = {
      type: tlvType,
      typeName: getTLVTypeName(tlvType),
      length,
      value: bytesToHex(value)
    };
    
    result.tlv!.push(tlvEntry);

    // Parse specific TLV types
    switch (tlvType) {
      case 0: // special (id for nevent/note, pubkey for nprofile/npub)
        if (type === 'nevent') {
          result.data.id = bytesToHex(value);
        } else if (type === 'nprofile' || type === 'naddr') {
          result.data.pubkey = bytesToHex(value);
        }
        break;
      case 1: // relay
        if (!result.data.relays) result.data.relays = [];
        result.data.relays.push(new TextDecoder().decode(value));
        break;
      case 2: // author
        result.data.author = bytesToHex(value);
        break;
      case 3: // kind
        result.data.kind = bytesToNumber(value);
        break;
      case 4: // d tag
        result.data.dTag = new TextDecoder().decode(value);
        break;
    }
    
    offset += 2 + length;
  }

  return result;
}

function getTLVTypeName(type: number): string {
  const names: Record<number, string> = {
    0: 'special',
    1: 'relay',
    2: 'author',
    3: 'kind',
    4: 'd-tag'
  };
  return names[type] || `unknown(${type})`;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function bytesToNumber(bytes: Uint8Array): number {
  let result = 0;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8) + bytes[i];
  }
  return result;
}

export async function validateEvent(event: NostrEvent): Promise<ValidationResult> {
  const errors: string[] = [];
  let idMatch = false;
  let sigValid = false;

  try {
    // Reconstruct the event for ID validation
    const eventForId = [
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
    ];
    
    const serialized = JSON.stringify(eventForId);
    const hash = await sha256(new TextEncoder().encode(serialized));
    const computedId = bytesToHex(new Uint8Array(hash));
    
    idMatch = computedId === event.id;
    if (!idMatch) {
      errors.push('Event ID does not match computed hash');
    }

    // Validate signature
    try {
      const messageHash = hexToBytes(event.id);
      const signature = hexToBytes(event.sig);
      const pubkey = hexToBytes(event.pubkey);
      
      sigValid = schnorr.verify(signature, messageHash, pubkey);
      if (!sigValid) {
        errors.push('Invalid signature');
      }
    } catch (sigError) {
      errors.push('Signature validation failed: ' + (sigError as Error).message);
    }

  } catch (error) {
    errors.push('Validation error: ' + (error as Error).message);
  }

  return {
    isValid: idMatch && sigValid && errors.length === 0,
    idMatch,
    sigValid,
    errors
  };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function sha256(data: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.digest('SHA-256', data);
}

export function formatTimestamp(timestamp: number): {
  absolute: string;
  relative: string;
} {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const absolute = date.toLocaleString();
  
  let relative: string;
  if (diff < 60000) {
    relative = 'Just now';
  } else if (diff < 3600000) {
    relative = `${Math.floor(diff / 60000)} minutes ago`;
  } else if (diff < 86400000) {
    relative = `${Math.floor(diff / 3600000)} hours ago`;
  } else if (diff < 604800000) {
    relative = `${Math.floor(diff / 86400000)} days ago`;
  } else {
    relative = date.toLocaleDateString();
  }
  
  return { absolute, relative };
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function truncateId(id: string, length: number = 8): string {
  if (id.length <= length * 2) return id;
  return `${id.slice(0, length)}...${id.slice(-length)}`;
}