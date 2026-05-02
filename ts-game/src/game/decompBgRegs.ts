export {
  BG_CONTROL_REG_OFFSETS as gBGControlRegOffsets,
  BG_HOFFSET_REG_OFFSETS as gBGHOffsetRegOffsets,
  BG_VOFFSET_REG_OFFSETS as gBGVOffsetRegOffsets,
  BLDCNT_TARGET1_BG_FLAGS as gBLDCNTTarget1BGFlags,
  DISPCNT_BG_FLAGS as gDISPCNTBGFlags,
  OVERWORLD_BACKGROUND_LAYER_FLAGS as gOverworldBackgroundLayerFlags
} from '../rendering/decompBgRegs';

export const gBGControlRegs = ['REG_BG0CNT', 'REG_BG1CNT', 'REG_BG2CNT', 'REG_BG3CNT'] as const;
export const gBGHOffsetRegs = ['REG_BG0HOFS', 'REG_BG1HOFS', 'REG_BG2HOFS', 'REG_BG3HOFS'] as const;
export const gBGVOffsetRegs = ['REG_BG0VOFS', 'REG_BG1VOFS', 'REG_BG2VOFS', 'REG_BG3VOFS'] as const;
