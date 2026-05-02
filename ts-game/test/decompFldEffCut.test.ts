import { describe, expect, test } from 'vitest';
import {
  FLDEFF_CUT_GRASS,
  FLDEFF_USE_CUT_ON_GRASS,
  FLDEFF_USE_CUT_ON_TREE,
  FieldCallback_CutGrass,
  FieldCallback_CutTree,
  FieldMoveCallback_CutGrass,
  FieldMoveCallback_CutTree,
  FldEff_CutGrass,
  FldEff_UseCutOnGrass,
  FldEff_UseCutOnTree,
  GAME_STAT_USED_CUT,
  MetatileAtCoordsIsGrassTile,
  SE_M_CUT,
  SetCutGrassMetatileAt,
  SetUpFieldMove_Cut,
  SpriteCallback_CutGrass_Cleanup,
  SpriteCallback_CutGrass_Init,
  SpriteCallback_CutGrass_Run,
  createFldEffCutRuntime,
  fieldCallbackCutGrass,
  fieldCallbackCutTree,
  fieldMoveCallbackCutGrass,
  fieldMoveCallbackCutTree,
  fldEffCutGrass,
  fldEffUseCutOnGrass,
  fldEffUseCutOnTree,
  metatileAtCoordsIsGrassTile,
  setCutGrassMetatileAt,
  setCutTile,
  setUpFieldMoveCut,
  spriteCallbackCutGrassCleanup,
  spriteCallbackCutGrassInit,
  spriteCallbackCutGrassRun
} from '../src/game/decompFldEffCut';

describe('decomp fldeff_cut', () => {
  test('exports exact C names as aliases of the implemented Cut logic', () => {
    expect(MetatileAtCoordsIsGrassTile).toBe(metatileAtCoordsIsGrassTile);
    expect(SetUpFieldMove_Cut).toBe(setUpFieldMoveCut);
    expect(FieldCallback_CutGrass).toBe(fieldCallbackCutGrass);
    expect(FldEff_UseCutOnGrass).toBe(fldEffUseCutOnGrass);
    expect(FieldCallback_CutTree).toBe(fieldCallbackCutTree);
    expect(FldEff_UseCutOnTree).toBe(fldEffUseCutOnTree);
    expect(FieldMoveCallback_CutGrass).toBe(fieldMoveCallbackCutGrass);
    expect(FldEff_CutGrass).toBe(fldEffCutGrass);
    expect(SetCutGrassMetatileAt).toBe(setCutGrassMetatileAt);
    expect(SpriteCallback_CutGrass_Init).toBe(spriteCallbackCutGrassInit);
    expect(SpriteCallback_CutGrass_Run).toBe(spriteCallbackCutGrassRun);
    expect(SpriteCallback_CutGrass_Cleanup).toBe(spriteCallbackCutGrassCleanup);
    expect(FieldMoveCallback_CutTree).toBe(fieldMoveCallbackCutTree);
  });

  test('SetUpFieldMove_Cut prioritizes Dotted Hole then cut tree then 3x3 grass', () => {
    const runtime = createFldEffCutRuntime();
    runtime.cutMoveRuinValleyCheck = true;
    expect(setUpFieldMoveCut(runtime)).toBe(true);
    expect(runtime.scheduleOpenDottedHole).toBe(true);
    expect(runtime.postMenuFieldCallback).toBe('FieldCallback_CutGrass');

    const treeRuntime = createFldEffCutRuntime();
    treeRuntime.cutTreeInFront = true;
    expect(setUpFieldMoveCut(treeRuntime)).toBe(true);
    expect(treeRuntime.postMenuFieldCallback).toBe('FieldCallback_CutTree');

    const grassRuntime = createFldEffCutRuntime();
    grassRuntime.playerFacingPosition = { x: 5, y: 5, elevation: 2 };
    setCutTile(grassRuntime, 6, 4, { elevation: 2, metatileId: 'General_Plain_Grass', isGrass: true });
    expect(setUpFieldMoveCut(grassRuntime)).toBe(true);
    expect(grassRuntime.postMenuFieldCallback).toBe('FieldCallback_CutGrass');

    const noneRuntime = createFldEffCutRuntime();
    noneRuntime.playerFacingPosition = { x: 5, y: 5, elevation: 2 };
    setCutTile(noneRuntime, 5, 5, { elevation: 1, metatileId: 'General_Plain_Grass', isGrass: true });
    expect(setUpFieldMoveCut(noneRuntime)).toBe(false);
  });

  test('field callbacks set arguments, scripts, stats, and followup field effects', () => {
    const runtime = createFldEffCutRuntime();
    runtime.cursorSelectionMonId = 4;

    fieldCallbackCutGrass(runtime);
    expect(runtime.fieldEffectsStarted).toEqual([FLDEFF_USE_CUT_ON_GRASS]);
    expect(runtime.fieldEffectArguments[0]).toBe(4);
    expect(fldEffUseCutOnGrass(runtime)).toBe(false);
    expect(runtime.gameStats[GAME_STAT_USED_CUT]).toBe(1);

    fieldCallbackCutTree(runtime);
    expect(runtime.scriptsSetup).toEqual(['EventScript_FldEffCut']);
    expect(fldEffUseCutOnTree(runtime)).toBe(false);
    expect(runtime.gameStats[GAME_STAT_USED_CUT]).toBe(2);

    fieldMoveCallbackCutGrass(runtime);
    expect(runtime.fieldEffectsRemoved).toContain(FLDEFF_USE_CUT_ON_GRASS);
    expect(runtime.fieldEffectsStarted).toContain(FLDEFF_CUT_GRASS);

    runtime.scheduleOpenDottedHole = true;
    fieldMoveCallbackCutGrass(runtime);
    expect(runtime.dottedHoleOpened).toBe(1);

    fieldMoveCallbackCutTree(runtime);
    expect(runtime.sounds).toContain(SE_M_CUT);
    expect(runtime.fieldEffectsRemoved).toContain(FLDEFF_USE_CUT_ON_TREE);
    expect(runtime.scriptContextEnabled).toBe(1);
  });

  test('cut grass maps matching metatiles, enables ground effects, and spawns eight sprites', () => {
    const runtime = createFldEffCutRuntime();
    runtime.playerFacingPosition = { x: 10, y: 10, elevation: 3 };
    setCutTile(runtime, 9, 9, { elevation: 3, metatileId: 'General_Plain_Grass', isGrass: true });
    setCutTile(runtime, 10, 10, { elevation: 3, metatileId: 'FuchsiaCity_SafariZoneTreeTopMiddle_Grass', isGrass: true });
    setCutTile(runtime, 11, 11, { elevation: 2, metatileId: 'General_Plain_Grass', isGrass: true });
    expect(metatileAtCoordsIsGrassTile(runtime, 9, 9)).toBe(true);

    expect(fldEffCutGrass(runtime)).toBe(false);

    expect(runtime.sounds).toEqual([SE_M_CUT]);
    expect(runtime.map.get('9,9')?.metatileId).toBe('General_Plain_Mowed');
    expect(runtime.map.get('10,10')?.metatileId).toBe('FuchsiaCity_SafariZoneTreeTopMiddle_Mowed');
    expect(runtime.map.get('11,11')?.metatileId).toBe('General_Plain_Grass');
    expect(runtime.groundEffectsEnabled).toEqual([{ x: 9, y: 9 }, { x: 10, y: 10 }]);
    expect(runtime.wholeMapDraws).toBe(1);
    expect(runtime.cutGrassSpriteArrayPtr).toHaveLength(8);
    expect(runtime.sprites[runtime.cutGrassSpriteArrayPtr?.[0] ?? 0]).toMatchObject({ x: 48, y: 70 });
    expect(runtime.sprites[runtime.cutGrassSpriteArrayPtr?.[7] ?? 0].data[2]).toBe(224);
  });

  test('SetCutGrassMetatileAt ignores unmapped grass ids', () => {
    const runtime = createFldEffCutRuntime();
    setCutTile(runtime, 1, 2, { elevation: 0, metatileId: 'Unknown_Grass', isGrass: true });
    setCutGrassMetatileAt(runtime, 1, 2);
    expect(runtime.map.get('1,2')?.metatileId).toBe('Unknown_Grass');
  });

  test('cut grass sprite callbacks match init, run, cleanup lifecycle', () => {
    const runtime = createFldEffCutRuntime();
    runtime.playerFacingPosition = { x: 0, y: 0, elevation: 0 };
    setCutTile(runtime, 0, 0, { elevation: 0, metatileId: 'General_Plain_Grass', isGrass: true });
    fldEffCutGrass(runtime);
    const sprite = runtime.sprites[runtime.cutGrassSpriteArrayPtr?.[0] ?? 1];

    spriteCallbackCutGrassInit(sprite);
    expect(sprite.data.slice(0, 4)).toEqual([8, 0, 0, 0]);
    expect(sprite.callback).toBe('SpriteCallback_CutGrass_Run');

    spriteCallbackCutGrassRun(sprite);
    expect(sprite.x2).toBe(0);
    expect(sprite.y2).toBe(8);
    expect(sprite.data.slice(0, 4)).toEqual([9, 1, 8, 1]);

    sprite.data[1] = 28;
    spriteCallbackCutGrassRun(sprite);
    expect(sprite.callback).toBe('SpriteCallback_CutGrass_Cleanup');

    spriteCallbackCutGrassCleanup(runtime, sprite);
    expect(runtime.cutGrassSpriteArrayPtr).toBeNull();
    expect(runtime.fieldEffectsStopped).toEqual([`${sprite.id}:${FLDEFF_CUT_GRASS}`]);
    expect(runtime.playerMovementCleared).toBe(1);
    expect(runtime.playerControlsUnlocked).toBe(1);
  });
});
