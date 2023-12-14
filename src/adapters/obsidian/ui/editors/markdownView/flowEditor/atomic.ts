import {
  Annotation,
  EditorSelection,
  EditorState,
  Transaction
} from "@codemirror/state";
import { focusFlowEditor } from "adapters/obsidian/utils/flow/flowEditor";
import MakeMDPlugin from "main";
import { flowEditorInfo } from "./flowEditor";
import { flowIDStateField } from "./flowStateFields";
import { lineRangeToPosRange, selectiveLinesFacet } from "./selectiveEditor";

//Handle selection and keyboard events for floweditor

export const arrowKeyAnnotation = Annotation.define<number>();

export const atomicSelect = (plugin: MakeMDPlugin) => EditorState.transactionFilter.of(
  (tr: Transaction) => {
    if (tr.isUserEvent("delete") || tr.isUserEvent("input")) {
      return tr;
    }
    const flowID = tr.startState.field(flowIDStateField, false);
    if (tr.annotation(arrowKeyAnnotation) && flowID) {
      const oldSel = tr.startState.selection.main;
      const lineRange = tr.state.field(selectiveLinesFacet, false);
      const posRange =
        lineRange && lineRange[0] != undefined
          ? lineRangeToPosRange(tr.startState, lineRange)
          : { from: 0, to: tr.startState.doc.length };
      if (
        oldSel.from <= posRange.from &&
        tr.annotation(arrowKeyAnnotation) == 3
      ) {
        focusFlowEditor(plugin, flowID, true, true);

      }
      if (oldSel.to >= posRange.to && tr.annotation(arrowKeyAnnotation) == 4) {
        focusFlowEditor(plugin, flowID, false, true);
      }
      return tr;
    }
    const selection = tr.newSelection.main;
    if (
      (selection.from == 0 && selection.to == 0) ||
      selection.from != selection.to
    )
      return tr;
    const flowEditors = tr.state.field(flowEditorInfo, false);
    if (flowEditors) {
      for (const info of flowEditors) {
        if (info.embed == 1) {
          if (
            info.from - 3 <= selection.from &&
            info.to + 2 >= selection.to &&
            info.expandedState == 2
          ) {
            const top =
              tr.annotation(arrowKeyAnnotation) == 1 ||
              tr.startState.selection.main.from > selection.from
                ? false
                : true;
                focusFlowEditor(plugin, info.id, top, false);
            return {
              selection: EditorSelection.single(info.from - 4),
            };
            break;
          }
        }
      }
    }

    //   return tr;
    return tr;
  }
);
