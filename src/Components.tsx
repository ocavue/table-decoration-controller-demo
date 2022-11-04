import { css } from "@emotion/css";
import React, { RefCallback } from "react";

export interface DeleteButtonProps extends React.HTMLProps<HTMLDivElement> {
  innerRef?: RefCallback<HTMLElement>;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  innerRef,
  ...rest
}) => {
  return (
    <div
      ref={innerRef}
      {...rest}
      className={css`
        cursor: pointer;
        background: red;
        color: white;
        box-sizing: border-box;
        border-radius: 4px;
        font-family: monospace;
        font-size: 8px;
        width: 8px;
        height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <span>⨯</span>
    </div>
  );
};

export interface DeleteOverlayProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  height: number;
}

export const DeleteOverlay: React.FC<DeleteOverlayProps> = ({
  width,
  height,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={css`
        background: rgba(255 0 0 / 0.3);
        border: 1px solid red;
        width: ${width}px;
        height: ${height}px;
        z-index: 1;
      `}
    >
      &nbsp;
    </div>
  );
};

export interface AddButtonProps extends React.HTMLProps<HTMLDivElement> {
  innerRef?: RefCallback<HTMLElement>;
}

export const AddButton: React.FC<AddButtonProps> = ({ innerRef, ...rest }) => {
  return (
    <div
      ref={innerRef}
      {...rest}
      className={css`
        cursor: pointer;
        background: blue;
        color: white;
        box-sizing: border-box;
        border-radius: 4px;
        font-family: monospace;
        font-size: 8px;
        width: 8px;
        height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <span>+</span>
    </div>
  );
};

export interface AddOverlayProps extends React.HTMLProps<HTMLDivElement> {
  width?: number;
  height?: number;
}

export const AddOverlay: React.FC<AddOverlayProps> = ({
  width = 1,
  height = 1,
  ...rest
}) => {
  const direction = width === 1 ? "bottom" : "right";
  return (
    <div
      {...rest}
      className={css`
        background: repeating-linear-gradient(
          to ${direction},
          blue 0,
          blue 4px,
          white 4px,
          white 8px
        );
        box-sizing: border-box;
        cursor: pointer;
        width: ${width}px;
        height: ${height}px;
      `}
    >
      &nbsp;
    </div>
  );
};
