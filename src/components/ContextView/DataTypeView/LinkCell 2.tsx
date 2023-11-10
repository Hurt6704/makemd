import i18n from "i18n";
import { TFile } from "obsidian";
import React, { useEffect, useRef, useState } from "react";
import { uniq } from "utils/array";
import {
  getAllAbstractFilesInVault,
  getFolderPathFromString,
  openTFile,
} from "utils/file";
import { getFileFromString } from "utils/flow/flowEditor";
import {
  parseLinkDisplayString,
  parseLinkString,
  parseMultiString,
} from "utils/parser";
import { serializeMultiString } from "utils/serializer";
import { fileNameToString, filePathToString } from "utils/strings";
import { TableCellMultiProp } from "../TableView/TableView";
import { OptionCellBase } from "./OptionCell";

type LinkObject = {
  label: string;
  value: string;
  file?: TFile;
};

export const LinkCell = (props: TableCellMultiProp & { file: string }) => {
  const initialValue = (
    props.multi
      ? parseMultiString(props.initialValue) ?? []
      : [props.initialValue]
  ).filter((f) => f);
  const stringValueToLink = (strings: string[]) =>
    strings.map((f) => {
      return {
        label: parseLinkDisplayString(f),
        value: parseLinkString(f),
      };
    });
  useEffect(() => {
    setValue(
      resolveLinks(
        stringValueToLink(
          props.multi
            ? parseMultiString(props.initialValue) ?? []
            : [props.initialValue]
        )
      )
    );
  }, [props.initialValue]);
  const resolveLinks = (links: LinkObject[]) =>
    links.map((f) => ({
      value: f.value,
      label: filePathToString(f.value),
      file: getFileFromString(f.value, getFolderPathFromString(props.file)),
    }));
  const ref = useRef(null);
  const [value, setValue] = useState<LinkObject[]>(
    resolveLinks(stringValueToLink(initialValue))
  );

  const removeValue = (v: LinkObject) => {
    const newValues = value.filter((f) => f.value != v.value);
    setValue(newValues);
    props.saveValue(serializeMultiString(newValues.map((f) => f.value)));
  };

  const saveOptions = (_: string[], _value: string[]) => {
    if (!props.multi) {
      setValue(resolveLinks(stringValueToLink(_value)));
      props.saveValue(serializeMultiString(_value));
    } else {
      const newValue = _value[0];
      if (newValue) {
        const newValues = uniq([...value.map((f) => f.value), newValue]);
        setValue(resolveLinks(stringValueToLink(newValues)));
        props.saveValue(serializeMultiString(newValues));
      }
    }
  };
  const menuProps = () => {
    const options = getAllAbstractFilesInVault(props.plugin, app).map((f) => ({
      name: fileNameToString(f.name),
      value: f.path,
      description: f.path,
    }));
    const _options = !props.multi
      ? [{ name: i18n.menu.none, value: "" }, ...options]
      : options;
    return {
      multi: false,
      editable: true,
      value: value.map((f) => f.value),
      options: _options,
      saveOptions,
      placeholder: i18n.labels.linkItemSelectPlaceholder,
      detail: true,
      searchable: true,
      // onHide: () => props.setEditMode(null),
    };
  };

  const openLink = async (o: LinkObject) => {
    if (o.file) {
      openTFile(o.file, props.plugin, false);
    } else {
      //@ts-ignore
      const file = await app.fileManager.createNewMarkdownFile(
        app.vault.getRoot(),
        o.value
      );
      openTFile(file, props.plugin, false);
      setValue(resolveLinks(value));
    }
  };
  return (
    <OptionCellBase
      baseClass="mk-cell-link"
      menuProps={menuProps}
      getLabelString={(o) => o.label}
      valueClass={(o) =>
        o.file ? "mk-cell-link-item" : "mk-cell-link-unresolved"
      }
      openItem={openLink}
      value={value}
      multi={props.multi}
      editMode={props.editMode}
      removeValue={removeValue}
    ></OptionCellBase>
  );
};
