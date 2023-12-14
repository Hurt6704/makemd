import { Filter, Predicate, Sort } from "core/types/predicate";
import { FilterFunctionType } from "./filter";
import { filterFnTypes } from "./filterFns/filterFnTypes";
import { SortFunctionType, sortFnTypes } from "./sort";

export const defaultPredicateFnForType = (
  type: string,
  types: FilterFunctionType | SortFunctionType
) => {
  const fnType = Object.keys(types).find((f) =>
    types[f].type.find((g) => g == type)
  );
  return fnType;
};

export const predicateFnsForType = (
  type: string,
  types: FilterFunctionType | SortFunctionType
) => {
  const fnTypes = Object.keys(types).filter((f) =>
    types[f].type.find((g) => g == type)
  );
  return fnTypes;
};

export const cleanPredicateType = (
  type: Sort[] | Filter[],
  definedTypes: FilterFunctionType | SortFunctionType
) => {
  return type.filter((f) => Object.keys(definedTypes).find((g) => g == f.fn));
};

export const validatePredicate = (prevPredicate: Predicate): Predicate => {
  if (!prevPredicate) {
    return defaultPredicate;
  }
  return {
    ...defaultPredicate,
    view: prevPredicate.view,
    frame: prevPredicate.frame,
    frameProps: prevPredicate.frameProps,
    frameGroup: prevPredicate.frameGroup,
    filters: Array.isArray(prevPredicate.filters)
      ? (cleanPredicateType(prevPredicate.filters, filterFnTypes) as Filter[])
      : [],
    sort: Array.isArray(prevPredicate.sort)
      ? cleanPredicateType(prevPredicate.sort, sortFnTypes)
      : [],
    groupBy: Array.isArray(prevPredicate.groupBy) ? prevPredicate.groupBy : [],
    colsOrder: Array.isArray(prevPredicate.colsOrder)
      ? prevPredicate.colsOrder
      : [],
    colsHidden: Array.isArray(prevPredicate.colsHidden)
      ? prevPredicate.colsHidden
      : [],
    colsSize: prevPredicate.colsSize,
  };
};

export const defaultPredicate: Predicate = {
  view: "list",
  filters: [],
  frame: "",
  frameProps: {},
  frameGroup: "",
  sort: [],
  groupBy: [],
  colsOrder: [],
  colsHidden: [],
  colsSize: {},
};

export const defaultTablePredicate: Predicate = {
  view: "table",
  filters: [],
  frame: "",
  frameProps: {},
  frameGroup: "",
  sort: [],
  groupBy: [],
  colsOrder: [],
  colsHidden: [],
  colsSize: {},
};
