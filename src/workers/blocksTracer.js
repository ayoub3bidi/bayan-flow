/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * Python source of the `__bf` tracer that block programs call in their
 * executed form (see src/blocks/generators.js). It records compare, swap,
 * read, write, shuffle and sorted-check events on `arr` with the block id that
 * produced them, and stops runaway loops.
 * `__bf_run` calls `fn_name(arr)` for sorts or `fn_name(arr, target)` for
 * searches (when a target is given).
 */

export const BLOCKS_MAX_EVENTS = 25_000;
export const BLOCKS_MAX_TICKS = 1_000_000;

export const BLOCKS_TRACER_PY = `
import json
import random

class BFLimit(Exception):
    pass

class _BF:
    def __init__(self, max_events, max_ticks):
        self.events = []
        self.ticks = 0
        self.max_events = max_events
        self.max_ticks = max_ticks

    def _record(self, kind, arr, i, j, block_id):
        if len(self.events) >= self.max_events:
            raise BFLimit()
        self.events.append({"kind": kind, "i": i, "j": j, "array": list(arr), "blockId": block_id})

    def _compare(self, arr, i, j, block_id, result):
        self._record("compare", arr, i, j, block_id)
        return result

    def gt(self, arr, i, j, block_id):
        return self._compare(arr, i, j, block_id, arr[i] > arr[j])

    def lt(self, arr, i, j, block_id):
        return self._compare(arr, i, j, block_id, arr[i] < arr[j])

    def ge(self, arr, i, j, block_id):
        return self._compare(arr, i, j, block_id, arr[i] >= arr[j])

    def le(self, arr, i, j, block_id):
        return self._compare(arr, i, j, block_id, arr[i] <= arr[j])

    def cmp_target(self, arr, i, target, op, block_id):
        value = arr[i]
        result = {
            "EQ": value == target,
            "LT": value < target,
            "GT": value > target,
            "LTE": value <= target,
            "GTE": value >= target,
        }[op]
        self._record("compare", arr, i, None, block_id)
        return result

    def get(self, arr, i, block_id):
        value = arr[i]
        self._record("read", arr, i, None, block_id)
        return value

    def set(self, arr, i, value, block_id):
        arr[i] = value
        self._record("write", arr, i, None, block_id)

    def shuffle(self, arr, block_id):
        random.shuffle(arr)
        self._record("shuffle", arr, None, None, block_id)

    def is_sorted(self, arr, block_id):
        self._record("check", arr, None, None, block_id)
        return all(arr[k] <= arr[k + 1] for k in range(len(arr) - 1))

    def swap(self, arr, i, j, block_id):
        arr[i], arr[j] = arr[j], arr[i]
        self._record("swap", arr, i, j, block_id)

    def tick(self):
        self.ticks += 1
        if self.ticks > self.max_ticks:
            raise BFLimit()

def __bf_run(code, fn_name, input_json, target_json, max_events, max_ticks):
    tracer = _BF(max_events, max_ticks)
    scope = {"__bf": tracer, "__name__": "__bayan_blocks__"}
    try:
        exec(code, scope)
        args = [list(json.loads(input_json))]
        if target_json is not None:
            args.append(json.loads(target_json))
        returned = scope[fn_name](*args)
        is_index = isinstance(returned, int) and not isinstance(returned, bool)
        return json.dumps({
            "events": tracer.events,
            "finalArray": list(returned) if isinstance(returned, list) else None,
            "result": returned if is_index else None,
        })
    except BFLimit:
        return json.dumps({"errorKind": "loop-limit"})
    except Exception as error:
        return json.dumps({"errorKind": "runtime", "error": type(error).__name__ + ": " + str(error)})
`;
