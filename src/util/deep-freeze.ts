/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { isArray, isNonNullObject, isRecord, RecordOrArray } from './type-guards';

export default function deepFreeze<T extends RecordOrArray>(value: T): Readonly<T> {
    if (isArray(value)) {
        value.filter(shouldFreeze).forEach(deepFreeze);
    } else if (isRecord(value)) {
        Object.keys(value).map(key => value[key]).filter(shouldFreeze).forEach(deepFreeze);
    }
    Object.freeze(value);
    return value;
}

function shouldFreeze(value: unknown): value is RecordOrArray {
    return isNonNullObject(value) && !Object.isFrozen(value)
}
