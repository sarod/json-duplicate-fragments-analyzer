import stableStringify from 'json-stable-stringify';

import { AnalyzerResult } from './AnalyzerResult';
import { DuplicateInfo } from './DuplicateInfo';
import { JsonFragment } from './JsonFragment';
import { JsonValue } from './JsonValue';
import { Path } from './Path';


export type AnalyzeOptions = {
  indexPredicate: (value: JsonValue, path: Path) => boolean;
  maxFragmentsLimit: number;
}


export const defaultOptions: AnalyzeOptions = {
  indexPredicate: (value: JsonValue, path: Path) => true,
  maxFragmentsLimit: 100
}


export const analyzeJson = (json: string, options?: Partial<AnalyzeOptions>): AnalyzerResult => {
  const optionsWithDefaults = { ...defaultOptions, ...options };

  const rootValue = JSON.parse(json);
  const normalizedJsonTextLength = JSON.stringify(rootValue).length;
  const fragmentIndex = computeDedupFragmentIndex(rootValue, optionsWithDefaults);
  const fragmentsInfo = Object.entries(fragmentIndex)
    .map(
      ([key, fragments]): DuplicateInfo => {
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
    .filter(dupInfo => dupInfo.fragmentsCount >= 2)
    .sort((a, b) => {
      // Sort descending
      return b.stringifiedLength - a.stringifiedLength;
    })
    .slice(0, optionsWithDefaults.maxFragmentsLimit);

  return {
    originalJsonLength: json.length,
    compactJsonLength: normalizedJsonTextLength,
    fragmentsInfo,
  };
}



type FragmentIndex = {
  [hash: string]: JsonFragment[]
};


const computeDedupFragmentIndex = (rootValue: JsonValue, { indexPredicate }: AnalyzeOptions): FragmentIndex => {


  const addFragmentToIndex = (fragmentIndex: FragmentIndex, fragment: JsonFragment): FragmentIndex => {
    const hash = stableStringify(fragment.value);
    const previousSetForHash = fragmentIndex[hash] || [];
    return {
      ...fragmentIndex,
      [hash]: [...previousSetForHash, fragment]
    };
  }


  const indexObject = (value: JsonValue, path: Path, index: FragmentIndex): FragmentIndex => {
    if (value === null || value === undefined) {
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


