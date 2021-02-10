/**
 * Copyright (C) 2020  Dillon Redding
 *
 * See the full notice in the LICENSE file at the top level of the repository.
 */
import { isArray, isNonNullObject, isRecord, RecordOrArray } from './type-guards';

export default function deepFreeze<T extends RecordOrArray>(obj: T): Readonly<T> {
    if (isArray(obj)) {
        obj.filter(shouldFreeze).forEach(deepFreeze);
    } else if (isRecord(obj)) {
        Object.keys(obj).map(key => obj[key]).filter(shouldFreeze).forEach(deepFreeze);
    }
    Object.freeze(obj);
    return obj;
}

function shouldFreeze(value: unknown): value is RecordOrArray {
    return isNonNullObject(value) && !Object.isFrozen(value)
}
