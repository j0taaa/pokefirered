export type DynamicPlaceholderKey =
  | 'PLAYER'
  | 'STR_VAR_1'
  | 'STR_VAR_2'
  | 'STR_VAR_3'
  | 'STR_VAR_4';

export type DynamicPlaceholderMap = Partial<Record<DynamicPlaceholderKey, string>>;

export const DYNAMIC_PLACEHOLDER_TEXT_UTIL_C_TRANSLATION_UNIT = 'src/dynamic_placeholder_text_util.c';
export const CHAR_DYNAMIC = 0xf7;
export const EOS = 0xff;
export const NPC_TEXT_COLOR_NEUTRAL = 3;

const sStringPointers: Array<number[] | null> = Array.from({ length: 8 }, () => null);

const sTextColorTable = [
  0, 0, 0, 16, 17, 17, 17, 16, 16, 0, 0, 17, 1, 0, 17, 16,
  0, 16, 16, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0,
  17, 1, 0, 0, 0, 16, 17, 0, 16, 16, 16, 0, 1, 0, 51, 51,
  51, 51, 51, 51, 51, 51, 35, 34, 34, 34, 34, 34, 34, 34, 34, 34,
  34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 50
];

export interface RuntimePlaceholderState {
  startMenu: {
    playerName: string;
  };
  stringVars: Partial<Record<'STR_VAR_1' | 'STR_VAR_2' | 'STR_VAR_3' | 'STR_VAR_4', string>>;
}

const EMPTY_PLACEHOLDER = '';

export const expandDynamicPlaceholders = (
  text: string,
  placeholders: DynamicPlaceholderMap
): string =>
  text.replace(/\{(PLAYER|STR_VAR_[1-4])\}/gu, (_match, key: DynamicPlaceholderKey) =>
    placeholders[key] ?? EMPTY_PLACEHOLDER
  );

export const getRuntimeDynamicPlaceholders = (
  runtime: RuntimePlaceholderState
): DynamicPlaceholderMap => ({
  PLAYER: runtime.startMenu?.playerName ?? 'PLAYER',
  STR_VAR_1: runtime.stringVars?.STR_VAR_1 ?? EMPTY_PLACEHOLDER,
  STR_VAR_2: runtime.stringVars?.STR_VAR_2 ?? EMPTY_PLACEHOLDER,
  STR_VAR_3: runtime.stringVars?.STR_VAR_3 ?? EMPTY_PLACEHOLDER,
  STR_VAR_4: runtime.stringVars?.STR_VAR_4 ?? EMPTY_PLACEHOLDER
});

export const expandRuntimePlaceholders = (
  text: string,
  runtime: RuntimePlaceholderState
): string => expandDynamicPlaceholders(text, getRuntimeDynamicPlaceholders(runtime));

export function DynamicPlaceholderTextUtil_Reset(): void {
  for (let i = 0; i < sStringPointers.length; i++) sStringPointers[i] = null;
}

export function DynamicPlaceholderTextUtil_SetPlaceholderPtr(idx: number, ptr: number[] | null): void {
  if (idx < sStringPointers.length) sStringPointers[idx] = ptr;
}

export const DynamicPlaceholderTextUtil_ExpandPlaceholders = (src: number[]): number[] => {
  const dest: number[] = [];
  let srcIndex = 0;
  while ((src[srcIndex] ?? EOS) !== EOS) {
    if (src[srcIndex] !== CHAR_DYNAMIC) {
      dest.push(src[srcIndex] ?? EOS);
      srcIndex++;
    } else {
      srcIndex++;
      const placeholder = sStringPointers[src[srcIndex] ?? 0];
      if (placeholder != null) {
        for (const byte of placeholder) {
          if (byte === EOS) break;
          dest.push(byte);
        }
      }
      srcIndex++;
    }
  }
  dest.push(EOS);
  return dest;
};

export const DynamicPlaceholderTextUtil_GetPlaceholderPtr = (idx: number): number[] | null =>
  sStringPointers[idx] ?? null;

export function GetColorFromTextColorTable(graphicId: number): number {
  const test = graphicId >> 1;
  const shift = (graphicId & 1) << 2;
  if (test >= sTextColorTable.length) return NPC_TEXT_COLOR_NEUTRAL;
  return (sTextColorTable[test] >> shift) & 0xf;
}
