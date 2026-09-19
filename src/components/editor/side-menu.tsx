import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  AddBlockButton,
  DragHandleButton,
  SideMenu as BaseSideMenu,
  useBlockNoteEditor,
  useExtensionState,
  type SideMenuProps,
} from "@blocknote/react";

import { selectBlock } from "./select-block";

/**
 * BlockNote's default side menu, where a right click on the drag handle
 * selects the block's content and so opens the formatting toolbar over it.
 * A left click still opens the drag handle menu.
 */
export function SideMenu(props: SideMenuProps) {
  const editor = useBlockNoteEditor();
  const block = useExtensionState(SideMenuExtension, {
    selector: (state) => state?.block,
  });

  return (
    <BaseSideMenu {...props}>
      <AddBlockButton />
      {/* `contents` keeps the wrapper out of the side menu's layout and CSS */}
      <div
        className="contents"
        onContextMenu={(event) => {
          if (!block || !editor.isEditable) return;
          event.preventDefault();

          const select = () => {
            if (selectBlock(editor, block.id)) editor.focus();
          };
          // On macOS the context menu opens while the button is still down.
          // Releasing it then counts as a press outside the toolbar, which
          // closes it again, so the selection waits for the release there.
          if (event.buttons & 2) {
            window.addEventListener("mouseup", select, {
              once: true,
              capture: true,
            });
          } else {
            select();
          }
        }}
      >
        <DragHandleButton dragHandleMenu={props.dragHandleMenu} />
      </div>
    </BaseSideMenu>
  );
}
