/**
 * @jest-environment jsdom
 */
import {
  PARROQUIAS_TAB_NAME,
  ACOMPANANTES_TAB_NAME,
  COORDINA_TAB_NAME,
  HEMA_TAB_NAME,
  CALENDARIO_TAB_NAME,
  CAPACITACION_TAB_NAME,
  getTabScreens,
} from '../MainTabNavigator';

function tabScreensSet(userType) {
  return new Set(Object.keys(getTabScreens(userType)));
}

describe('getTabScreens', () => {
  it('works for admin and integrante_chm', () => {
    const expected = new Set([
      PARROQUIAS_TAB_NAME,
      ACOMPANANTES_TAB_NAME,
      COORDINA_TAB_NAME,
      HEMA_TAB_NAME,
      CALENDARIO_TAB_NAME,
      CAPACITACION_TAB_NAME,
    ]);
    expect(expected).toEqual(tabScreensSet('admin'));
    expect(expected).toEqual(tabScreensSet('integrante_chm'));
  });

  it('works for coordinador', () => {
    const expected = new Set([HEMA_TAB_NAME, CALENDARIO_TAB_NAME]);
    expect(expected).toEqual(tabScreensSet('coordinador'));
  });

  it('works for acompañante_zona and acompañante_decanato', () => {
    const expected = new Set([
      COORDINA_TAB_NAME,
      CALENDARIO_TAB_NAME,
      CAPACITACION_TAB_NAME,
    ]);
    expect(expected).toEqual(tabScreensSet('acompañante_zona'));
    expect(expected).toEqual(tabScreensSet('acompañante_decanato'));
  });

  it('works for capacitacion', () => {
    const expected = new Set([CALENDARIO_TAB_NAME, CAPACITACION_TAB_NAME]);
    expect(expected).toEqual(tabScreensSet('capacitacion'));
  });

  it('works for invalid type', () => {
    expect(new Set()).toEqual(tabScreensSet('invalid'));
  });
});
