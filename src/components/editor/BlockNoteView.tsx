//import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
//import * as Card from "@/components/ui/card";
import * as DropdownMenu from "./components/ui/dropdown-menu";
//* NOTE: DropDownMenu currently used above is the same as the legacy component, due to compatibility (do not replace yet)
// import * as Form from "@/components/ui/form";
// import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
// import * as Popover from "./popover";
// import * as Select from "./select";
// import * as Tabs from "@/components/ui/tabs";
// import * as Toggle from "@/components/ui/toggle";
import * as Tooltip from "@/components/ui/tooltip";

import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  SuggestionMenuController,
  GridSuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView as BaseBlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
// MAYBE: Enable for fallback fonts
//import "@blocknote/core/fonts/inter.css";
import "./styles.css";

import { useTheme } from "@/components/theme-provider";
//import { getCustomSlashMenuItems } from "./config";

export function BlockNoteView({
  editor,
  className,
  style,
  editable = true,
  lang = navigator.language || "en", // Pass the language that was from the website or user preference
  //MAYBE: If no language is passed, disable spellcheck?
  spellCheck = true,
  id = "lc-blocknote-view",
  //onSelectionChange, //* NOTE: Can be extracted and called like this editor.onSelectionChange
  //ref,
}: {
  editor: ReturnType<typeof useCreateBlockNote>;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  lang?: string;
  spellCheck?: boolean;
  id?: string;
  //onSelectionChange?: (() => void) | undefined;
  //ref?: (instance: HTMLDivElement | null) => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <BaseBlockNoteView
      editor={editor}
      className={className}
      style={style}
      editable={editable}
      theme={resolvedTheme} // can be left for now
      lang={lang}
      spellCheck={spellCheck}
      id={id}
      shadCNComponents={{
        //Badge,
        Button,
        // Card,
        DropdownMenu,
        // Form,
        // Input,
        Label,
        // Popover,
        // Select,
        // Tabs,
        // Toggle,
        Tooltip,
      }}
      formattingToolbar={false}
      emojiPicker={false}
      //onSelectionChange={onSelectionChange}
      //ref={ref}
      //slashMenu={false}
      //spellCheck={false}
      // MAYBE TODO: Add custom selector property
      //lc-data-theming
      // ...props
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />
            {/* Extra button to toggle blue text & background */}
            {/*<BlueButton key={"customButton"} />*/}
            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"replaceFileButton"} />
            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"strike"}
              key={"strikeStyleButton"}
            />
            {/* Extra button to toggle code styles */}
            <BasicTextStyleButton
              key={"codeStyleButton"}
              basicTextStyle={"code"}
            />
            <TextAlignButton
              textAlignment={"left"}
              key={"textAlignLeftButton"}
            />
            <TextAlignButton
              textAlignment={"center"}
              key={"textAlignCenterButton"}
            />
            <TextAlignButton
              textAlignment={"right"}
              key={"textAlignRightButton"}
            />
            <ColorStyleButton key={"colorStyleButton"} />
            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />
            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
        )}
      />
      <GridSuggestionMenuController
        triggerCharacter={":"}
        // Changes the Emoji Picker to only have 8 columns.
        columns={8}
        minQueryLength={2}
      />
      {/*<SuggestionMenuController
        triggerCharacter={"/"}
        // Replaces the default Slash Menu items with our custom ones.
        getItems={async (query) =>
          filterSuggestionItems(getCustomSlashMenuItems(editor), query)
        }
      />*/}
    </BaseBlockNoteView>
  );
}
