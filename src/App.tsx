import React, {
  MouseEventHandler,
  ReactNode,
  RefCallback,
  useCallback,
  useState,
} from "react";
import { FindProsemirrorNodeResult, NodeWithPosition } from "remirror";
import {
  activeCellColumnPositioner,
  ActiveCellColumnPositionerData,
  activeCellPositioner,
  activeCellRowPositioner,
  ActiveCellRowPositionerData,
  allColumnsStartPositioner,
  allRowsStartPositioner,
  HeadingExtension,
  selectedColumnPositioner,
  selectedRowPositioner,
  TableExtension,
  tablePositioner,
} from "remirror/extensions";
import {
  CommandMenuItem,
  DropdownButton,
  EditorComponent,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  Toolbar,
  useChainedCommands,
  useCommands,
  useMultiPositioner,
  UseMultiPositionerReturn,
  usePositioner,
  useRemirror,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { css } from "@emotion/css";
import { TableSelectorExtension } from "./table-selector-extension";

import {
  AddButton,
  AddButtonProps,
  AddOverlay,
  DeleteButton,
  DeleteOverlay,
} from "./Components";

import "./table-selector.css";

const styles = css`
  padding: var(--rmr-space-4) !important;
`;

const CommandMenu = () => {
  const commands = useCommands();

  return (
    <div>
      <p>commands:</p>
      <p
        className={css`
          display: flex;
          flex-direction: column;
          justify-items: flex-start;
          align-items: flex-start;
        `}
      >
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.createTable()}
        >
          create a table with the default options
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commands.createTable({
              rowsCount: 4,
              columnsCount: 4,
              withHeaderRow: false,
            })
          }
        >
          create a 4*4 table without headers
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commands.createTable({
              rowsCount: 4,
              columnsCount: 4,
              withHeaderRow: true,
            })
          }
        >
          create a 4*4 table with headers
        </button>
      </p>
    </div>
  );
};

const SelectAll: React.FC = () => {
  const { ref, x, y, active, data } = usePositioner<FindProsemirrorNodeResult>(
    tablePositioner,
    []
  );
  const { pos } = data;

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  const chain = useChainedCommands();

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    chain.selectText(pos).selectParentCell().expandCellSelection("all").run();
  }, [chain, pos]);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={css`
        box-sizing: border-box;
        cursor: pointer;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 10px;
        height: 10px;
      `}
      style={{
        left: x - 20,
        top: y - 20,
      }}
    >
      ⇲
    </div>
  );
};

interface ControllerCellProps
  extends Omit<UseMultiPositionerReturn, "key" | "ref" | "data"> {
  axis: "row" | "column" | "all";
  pos: number;
  innerRef: RefCallback<HTMLElement>;
}

const ControllerCell: React.FC<ControllerCellProps> = (props) => {
  const { x, y, width, height, pos, axis, innerRef } = props;

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  const chain = useChainedCommands();

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    chain.selectText(pos).selectParentCell().expandCellSelection(axis).run();
  }, [chain, pos, axis]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={css`
        background: var(--rmr-color-table-default-controller);
        border: 1px solid var(--rmr-color-table-default-border);
        box-sizing: border-box;
        cursor: pointer;
        position: absolute;
      `}
      style={{
        left: axis !== "column" ? x - 9.5 : x + 1,
        top: axis !== "row" ? y - 9.5 : y + 1,
        width: axis !== "column" ? 10 : width,
        height: axis !== "row" ? 10 : height,
      }}
      ref={innerRef}
    >
      &nbsp;
    </div>
  );
};

interface AddColumnRowProps extends AddButtonProps {
  Component: React.ComponentType<AddButtonProps>;
  onClick: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
}

const ButtonWithHoverChild: React.FC<AddColumnRowProps> = ({
  Component,
  children,
  onClick,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsHovered(true);
    }, []);

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsHovered(false);
    }, []);

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      onClick(e);
      setIsHovered(false);
    },
    [onClick]
  );

  return (
    <>
      <Component
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        {...rest}
      />
      {isHovered && <>{children}</>}
    </>
  );
};

const AddColumnButtons: React.FC = () => {
  const { ref, x, y, width, height, active, data } =
    usePositioner<ActiveCellColumnPositionerData>(
      activeCellColumnPositioner,
      []
    );
  const { pos } = data;

  const chain = useChainedCommands();

  const handleClickBefore: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      chain.selectText(pos).addTableColumnBefore().run();
    }, [chain, pos]);

  const handleClickAfter: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      chain.selectText(pos).addTableColumnAfter().run();
    }, [chain, pos]);

  if (!active) {
    return null;
  }

  return (
    <>
      <ButtonWithHoverChild
        Component={AddButton}
        innerRef={ref}
        onClick={handleClickBefore}
        style={{
          position: "absolute",
          left: x - 4,
          top: y - 24,
        }}
      >
        <AddOverlay
          height={height + 10}
          style={{
            position: "absolute",
            left: x,
            top: y - 10,
          }}
        />
      </ButtonWithHoverChild>
      <ButtonWithHoverChild
        Component={AddButton}
        onClick={handleClickAfter}
        style={{
          position: "absolute",
          left: x + width - 4,
          top: y - 24,
        }}
      >
        <AddOverlay
          height={height + 10}
          style={{
            position: "absolute",
            left: x + width,
            top: y - 10,
          }}
        >
          &nbsp;
        </AddOverlay>
      </ButtonWithHoverChild>
    </>
  );
};

const AddRowButtons: React.FC = () => {
  const { ref, x, y, width, height, active, data } =
    usePositioner<ActiveCellRowPositionerData>(activeCellRowPositioner, []);
  const { pos } = data;

  const chain = useChainedCommands();

  const handleClickBefore: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      chain.selectText(pos).addTableRowBefore().run();
    }, [chain, pos]);

  const handleClickAfter: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      chain.selectText(pos).addTableRowAfter().run();
    }, [chain, pos]);

  if (!active) {
    return null;
  }

  return (
    <>
      <ButtonWithHoverChild
        Component={AddButton}
        innerRef={ref}
        onClick={handleClickBefore}
        style={{
          position: "absolute",
          left: x - 24,
          top: y - 4,
        }}
      >
        <AddOverlay
          width={width + 10}
          style={{
            position: "absolute",
            left: x - 10,
            top: y,
          }}
        />
      </ButtonWithHoverChild>
      <ButtonWithHoverChild
        Component={AddButton}
        onClick={handleClickAfter}
        style={{
          position: "absolute",
          left: x - 24,
          top: y + height - 4,
        }}
      >
        <AddOverlay
          width={width + 10}
          style={{
            position: "absolute",
            left: x - 10,
            top: y + height,
          }}
        >
          &nbsp;
        </AddOverlay>
      </ButtonWithHoverChild>
    </>
  );
};

const DeleteColumnButton: React.FC = () => {
  const { ref, x, y, width, height, active } = usePositioner(
    selectedColumnPositioner,
    []
  );

  const { deleteTableColumn } = useCommands();

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    deleteTableColumn();
  }, [deleteTableColumn]);

  if (!active) {
    return null;
  }

  return (
    <ButtonWithHoverChild
      Component={DeleteButton}
      innerRef={ref}
      onClick={handleClick}
      style={{
        position: "absolute",
        left: x - 4 + width / 2,
        top: y - 24,
      }}
    >
      <DeleteOverlay
        height={height + 10}
        width={width}
        style={{
          position: "absolute",
          left: x,
          top: y - 10,
        }}
      />
    </ButtonWithHoverChild>
  );
};

const DeleteRowButton: React.FC = () => {
  const { ref, x, y, width, height, active } = usePositioner(
    selectedRowPositioner,
    []
  );

  const { deleteTableRow } = useCommands();

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    deleteTableRow();
  }, [deleteTableRow]);

  if (!active) {
    return null;
  }

  return (
    <>
      <ButtonWithHoverChild
        Component={DeleteButton}
        innerRef={ref}
        onClick={handleClick}
        style={{
          position: "absolute",
          left: x - 24,
          top: y - 4 + height / 2,
        }}
      >
        <DeleteOverlay
          height={height}
          width={width + 10}
          style={{
            position: "absolute",
            left: x - 10,
            top: y,
          }}
        />
      </ButtonWithHoverChild>
    </>
  );
};

const Dropdown = () => {
  const { mergeTableCells, setTableCellBackground, splitTableCell } =
    useCommands();
  return (
    <Toolbar>
      <DropdownButton aria-label="Table Menu">
        <CommandMenuItem
          commandName="setTableCellBackground"
          onSelect={() => setTableCellBackground("teal")}
          enabled={setTableCellBackground.enabled("teal")}
          label="Color teal"
          icon={null}
          displayDescription={false}
        />
        <CommandMenuItem
          commandName="setTableCellBackground"
          onSelect={() => setTableCellBackground("rgba(255,100,100,0.3)")}
          enabled={setTableCellBackground.enabled("rgba(255,100,100,0.3)")}
          label="Color pink"
          icon={null}
          displayDescription={false}
        />
        <CommandMenuItem
          commandName="setTableCellBackground"
          onSelect={() => setTableCellBackground(null)}
          enabled={setTableCellBackground.enabled(null)}
          label="Remove color"
          icon={null}
          displayDescription={false}
        />
        <CommandMenuItem
          commandName="mergeTableCells"
          onSelect={() => mergeTableCells()}
          enabled={mergeTableCells.enabled()}
          label="Merge cells"
          icon={null}
          displayDescription={false}
        />
        <CommandMenuItem
          commandName="splitTableCell"
          onSelect={() => splitTableCell()}
          enabled={splitTableCell.enabled()}
          label="Split cells"
          icon={null}
          displayDescription={false}
        />
      </DropdownButton>
    </Toolbar>
  );
};

const ActiveCellDropdown: React.FC = () => {
  const { ref, x, y, width, active } = usePositioner(activeCellPositioner, []);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={css`
        position: absolute;
        z-index: 2;
      `}
      style={{
        top: y + 4,
        left: x + width - 24,
      }}
    >
      <Dropdown />
    </div>
  );
};

const DeleteTableButton: React.FC = () => {
  const { ref, x, y, width, height, active } = usePositioner(
    tablePositioner,
    []
  );
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsHovered(true);
    }, []);

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsHovered(false);
    }, []);

  const { deleteTable } = useCommands();

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    deleteTable();
    setIsHovered(false);
  }, [deleteTable]);

  if (!active) {
    return null;
  }

  return (
    <>
      <div
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={css`
          background: white;
          border: 1px solid lightgrey;
          border-radius: 4px;
          cursor: pointer;
          position: absolute;
          transform: translateX(-50%);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
        style={{
          top: y + height + 10,
          left: x + width / 2,
        }}
      >
        🗑
      </div>
      {isHovered && (
        <DeleteOverlay
          height={height + 10}
          width={width + 10}
          style={{
            position: "absolute",
            left: x - 10,
            top: y - 10,
          }}
        />
      )}
    </>
  );
};

const Positioners = () => {
  const controllerRows = useMultiPositioner<NodeWithPosition>(
    allRowsStartPositioner,
    []
  );
  const controllerColumns = useMultiPositioner<NodeWithPosition>(
    allColumnsStartPositioner,
    []
  );

  return (
    <PositionerPortal>
      <>
        <ActiveCellDropdown />
        <SelectAll />
        {/* {controllerColumns.map(({ key, ref, data: { pos }, ...rest }) => (
          <ControllerCell
            key={key}
            axis="column"
            pos={pos}
            innerRef={ref}
            {...rest}
          />
        ))}
        {controllerRows.map(({ key, ref, data: { pos }, ...rest }) => (
          <ControllerCell
            key={key}
            axis="row"
            pos={pos}
            innerRef={ref}
            {...rest}
          />
        ))} */}
        <AddColumnButtons />
        <AddRowButtons />
        <DeleteColumnButton />
        <DeleteRowButton />
        <DeleteTableButton />
      </>
    </PositionerPortal>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new TableExtension(),
      new HeadingExtension({}),
      new TableSelectorExtension(),
    ],
  });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror
          manager={manager}
          initialContent={state}
          classNames={[styles]}
        >
          <EditorComponent />
          <CommandMenu />
          <Positioners />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

export default Basic;
