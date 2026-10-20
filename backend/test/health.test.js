import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from './stage-fixture.js';
test('call guide contains eight ordered stages',()=>{assert.equal(STAGES.length,8);assert.deepEqual(STAGES.map(s=>s.number),[1,2,3,4,5,6,7,8]);});
