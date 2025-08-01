import { Storage } from '@google-cloud/storage';
import { provide, singleton } from '../../sdk/di';
import {
    BucketGetter,
    FileGetter,
    FilesGetter,
} from './getters';

export const gcpStorageInject = provide({
    Storage: singleton(() => new Storage()),
    BucketGetter: BucketGetter,
    FilesGetter: FilesGetter,
    FileGetter: FileGetter,
});
