import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as DropdownMenu from "./dropdown-menu";
import * as Form from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as Popover from "./popover";
import * as Select from "./select";
import * as Tabs from "@/components/ui/tabs";
import * as Toggle from "@/components/ui/toggle";
import * as Tooltip from "@/components/ui/tooltip";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

export function AppBlockNoteView({
  editor,
  className,
  style,
}: {
  editor: ReturnType<typeof useCreateBlockNote>;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <BlockNoteView
      editor={editor}
      shadCNComponents={{
        Badge,
        Button,
        Card,
        DropdownMenu,
        Form,
        Input,
        Label,
        Popover,
        Select,
        Tabs,
        Toggle,
        Tooltip,
      }}
      className={className}
      style={style}
    />
  );
}
