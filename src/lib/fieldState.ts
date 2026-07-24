import type { ExtractedField } from '@/types';
import type { FieldState } from '@/components/field/Field';

export function fieldStateFor(field: ExtractedField): FieldState {
  if (field.status === 'flagged') return 'flagged';
  if (field.status === 'verified') return 'verified';
  if (field.editable) return field.aiGenerated ? 'ai_unverified' : 'editable';
  return 'locked';
}
