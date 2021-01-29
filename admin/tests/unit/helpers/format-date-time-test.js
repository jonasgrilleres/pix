import { module, test } from 'qunit';
import { formatDateTime } from 'pix-admin/helpers/format-date-time';

module('Unit | Helpers | formatDateTime', () => {

  test('it should return null if the given value is null', (assert) => {
    // given
    const date = null;

    // when
    const value = formatDateTime([date]);

    // then
    assert.equal(value, null);
  });

  test('it should return formatted date with time', (assert) => {
    // given
    const date = new Date('2020-08-14T01:02:03Z');

    // when
    const value = formatDateTime([date]);

    // then
    assert.equal(value, '14/08/2020 01:02:03');
  });

});
