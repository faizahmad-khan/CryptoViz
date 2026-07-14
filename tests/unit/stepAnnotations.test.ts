import { describe, expect, it } from 'vitest'
import {
  STEP_ANNOTATIONS_VERSION,
  STEP_NOTE_MAX_LENGTH,
  clearScopeAnnotations,
  createStableStepId,
  getScopeAnnotations,
  normalizeStepAnnotationStore,
  toggleStepBookmark,
  updateStepNote,
  type StepAnnotationStore,
} from '../../lib/utils/stepAnnotations'

const emptyStore: StepAnnotationStore = {
  version: STEP_ANNOTATIONS_VERSION,
  scopes: {},
}

const scope = {
  cipherId: 'caesar',
  direction: 'encrypt' as const,
}

describe('step annotation utilities', () => {
  it('creates stable step identifiers', () => {
    expect(createStableStepId('Apply shift', 2)).toBe('2-apply-shift')
    expect(createStableStepId('***', 0)).toBe('0-step')
  })

  it('stores notes separately by cipher and direction', () => {
    const encryptStore = updateStepNote(
      emptyStore,
      scope,
      '0-start',
      'Start',
      'Encrypt note',
    )

    expect(getScopeAnnotations(encryptStore, scope)).toHaveLength(1)
    expect(
      getScopeAnnotations(encryptStore, {
        cipherId: 'caesar',
        direction: 'decrypt',
      }),
    ).toEqual([])
  })

  it('does not store empty notes without a bookmark', () => {
    const store = updateStepNote(
      emptyStore,
      scope,
      '0-start',
      'Start',
      '   ',
    )
    expect(getScopeAnnotations(store, scope)).toEqual([])
  })

  it('limits notes to the documented maximum length', () => {
    const store = updateStepNote(
      emptyStore,
      scope,
      '0-start',
      'Start',
      'a'.repeat(STEP_NOTE_MAX_LENGTH + 50),
    )

    expect(getScopeAnnotations(store, scope)[0].note).toHaveLength(
      STEP_NOTE_MAX_LENGTH,
    )
  })

  it('toggles bookmarks without deleting an existing note', () => {
    const withNote = updateStepNote(
      emptyStore,
      scope,
      '0-start',
      'Start',
      'Important',
    )
    const bookmarked = toggleStepBookmark(
      withNote,
      scope,
      '0-start',
      'Start',
    )
    const unbookmarked = toggleStepBookmark(
      bookmarked,
      scope,
      '0-start',
      'Start',
    )

    expect(getScopeAnnotations(bookmarked, scope)[0].bookmarked).toBe(true)
    expect(getScopeAnnotations(unbookmarked, scope)[0].note).toBe('Important')
  })

  it('clears annotations only for the active scope', () => {
    const withEncrypt = updateStepNote(
      emptyStore,
      scope,
      '0-start',
      'Start',
      'Encrypt',
    )
    const withDecrypt = updateStepNote(
      withEncrypt,
      { cipherId: 'caesar', direction: 'decrypt' },
      '0-start',
      'Start',
      'Decrypt',
    )

    const cleared = clearScopeAnnotations(withDecrypt, scope)

    expect(getScopeAnnotations(cleared, scope)).toEqual([])
    expect(
      getScopeAnnotations(cleared, {
        cipherId: 'caesar',
        direction: 'decrypt',
      }),
    ).toHaveLength(1)
  })

  it('recovers safely from malformed storage data', () => {
    expect(normalizeStepAnnotationStore(null)).toEqual(emptyStore)
    expect(
      normalizeStepAnnotationStore({
        version: STEP_ANNOTATIONS_VERSION,
        scopes: {
          'caesar:encrypt': [
            null,
            {
              stepId: '0-start',
              stepLabel: 'Start',
              note: 'Valid',
              bookmarked: false,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      }).scopes['caesar:encrypt'],
    ).toHaveLength(1)
  })
})
