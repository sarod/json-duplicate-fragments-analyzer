import stableStringify from 'json-stable-stringify';
import { number } from 'prop-types';


export interface JsonFragment {
  value: JsonValue;
  path: Path
}


export type JsonDupsInfo = {
  originalJsonTextLength: number,
  normalizedJsonTextLength: number,
  fragmentsInfo: FragmentInfo[];
}

export type FragmentInfo = {
  fragmentsCount: number;
  stringifiedLength: number;
  percentOfTotalLength: number;
  preview: string;
  fragments: JsonFragment[];
};

export type Path = string[];

export type Options = {
  indexPredicate: (value: JsonValue, path: Path) => boolean;
  maxFragmentsLimit: number;
}

export interface JsonObject { [key: string]: JsonValue };
export interface JsonArray extends Array<JsonValue> {
}
export type JsonValue = number | string | boolean | JsonArray | JsonObject;


export const defaultOptions: Options = {
  indexPredicate: (value: JsonValue, path: Path) => true,
  maxFragmentsLimit: 100
}


export const computeJsonDupsInfo = (json: string, options?: Partial<Options>): JsonDupsInfo => {
  const optionsWithDefaults = { ...defaultOptions, ...options };

  const rootValue = JSON.parse(json);
  const normalizedJsonTextLength = JSON.stringify(rootValue).length;
  const fragmentIndex = computeDedupFragmentIndex(rootValue, optionsWithDefaults);
  const fragmentsInfo = Object.entries(fragmentIndex)
    .map(
      ([key, fragments]): FragmentInfo => {
        const stringifiedLength = fragments.map(f => JSON.stringify(f.value).length).reduce((sum, v) => sum + v);
        return {
          preview: JSON.stringify(fragments[0].value).substr(0, 200),
          fragmentsCount: fragments.length,
          stringifiedLength: stringifiedLength,
          percentOfTotalLength: (stringifiedLength / normalizedJsonTextLength) * 100,
          fragments,

        }
      }
    )
    .filter(dupInfo => dupInfo.fragmentsCount > 2)
    .sort((a, b) => {
      // Sort descending
      return b.stringifiedLength - a.stringifiedLength;
    })
    .slice(0, optionsWithDefaults.maxFragmentsLimit);

  return {
    originalJsonTextLength: json.length,
    normalizedJsonTextLength: normalizedJsonTextLength,
    fragmentsInfo,
  };
}



type FragmentIndex = {
  [hash: string]: JsonFragment[]
};


const computeDedupFragmentIndex = (rootValue: JsonValue, { indexPredicate }: Options): FragmentIndex => {


  const addFragmentToIndex = (fragmentIndex: FragmentIndex, fragment: JsonFragment): FragmentIndex => {
    const hash = stableStringify(fragment.value);
    const previousSetForHash = fragmentIndex[hash] || [];
    return {
      ...fragmentIndex,
      [hash]: [...previousSetForHash, fragment]
    };
  }


  const indexObject = (value: JsonValue, path: Path, index: FragmentIndex): FragmentIndex => {
    if (value == null || value == undefined) {
      return index;
    }
    if (!indexPredicate(value, path)) {
      return index;
    }

    index = addFragmentToIndex(index, { value: value, path: path });


    if (Array.isArray(value) || typeof value === 'object') {
      return Object.keys(value).reduce(
        (index, key) => {
          const newPath = [...path, key];
          const newValue = (value as any)[key] as JsonValue;
          return indexObject(newValue, newPath, index);
        }
        , index);
    } else {
      return index;
    }
  }

  const rootPath: Path = [];
  const emptyIndex: FragmentIndex = {};
  return indexObject(rootValue, rootPath, emptyIndex);
}


