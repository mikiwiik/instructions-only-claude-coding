# User Flow Diagrams

This document illustrates the main user interaction flows for the Todo App using Mermaid diagrams.

## Add New Todo Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Form[User sees text input field]
    Form --> Input{User types<br/>todo text?}
    Input -->|No text| Form
    Input -->|Text entered| Decision{Submit method?}
    Decision -->|Click Add button| Validate
    Decision -->|Press Enter| Validate
    Validate{Text valid?}
    Validate -->|Empty/whitespace| Form
    Validate -->|Valid text| Create[Todo created with timestamp]
    Create --> Clear[Input field cleared]
    Clear --> Display[New todo appears at bottom of active list]
    Display --> Focus[Focus returns to input field]
    Focus --> End([Ready for next todo])
```

**User Actions:**

- Type todo text in input field (supports Markdown syntax)
- Submit via Enter key or clicking "Add" button
- Input automatically clears after successful submission

**System Behavior:**

- Only non-empty text creates todos
- New todos appear in active list
- Focus returns to input for continuous adding
- Auto-resize textarea based on content

## Toggle Todo Status Flow

```mermaid
flowchart TD
    Start([User sees active todo]) --> Method{Interaction method?}
    Method -->|Desktop: Click circle| Toggle
    Method -->|Mobile: Swipe right| Toggle
    Method -->|Keyboard: Tab + Space| Toggle
    Toggle[Mark todo as completed]
    Toggle --> Icon[Circle icon changes to checkmark]
    Icon --> Strike[Text gets strikethrough]
    Strike --> Time[Timestamp shows completion time]
    Time --> Filter{Current filter?}
    Filter -->|All| Stay[Todo remains visible]
    Filter -->|Active| Remove[Todo disappears from view]
    Filter -->|Completed| Stay
    Stay --> End1([Todo stays in list])
    Remove --> End2([Todo hidden from active view])
```

**User Actions:**

- Click/tap the circle icon (desktop/mobile)
- Swipe right gesture (mobile only)
- Keyboard: Tab to circle, press Space/Enter

**System Behavior:**

- Icon changes from circle to checkmark
- Text gets strikethrough styling
- Timestamp updates to show completion time
- Todo moves to completed filter
- Cannot be unchecked via circle (use undo instead)

## Undo Completion Flow

```mermaid
flowchart TD
    Start([User sees completed todo]) --> Location{Where is user?}
    Location -->|All filter| See[Undo button visible]
    Location -->|Completed filter| See
    Location -->|Active filter| Hidden[Todo not visible]
    See --> Click[User clicks undo button]
    Click --> Restore[Todo marked as active again]
    Restore --> Icon[Checkmark changes back to circle]
    Icon --> NoStrike[Strikethrough removed]
    NoStrike --> Time[Timestamp resets]
    Time --> Move[Todo returns to active list]
    Move --> End([Todo is active again])
    Hidden --> End2([No action possible])
```

**User Actions:**

- Click the undo button (curved arrow icon) on completed todo
- Available in "All" and "Completed" filters

**System Behavior:**

- Todo returns to active state
- Checkmark reverts to circle
- Strikethrough styling removed
- Todo reappears in active list

## Edit Todo Flow

```mermaid
flowchart TD
    Start([User sees active todo]) --> State{Todo state?}
    State -->|Completed| NoEdit[Edit button hidden]
    State -->|Active| Method{Edit method?}
    Method -->|Desktop: Click edit button| EditMode
    Method -->|Mobile: Long press 500ms| EditMode
    EditMode[Enter edit mode]
    EditMode --> Show[Textarea appears with current text]
    Show --> Help[Markdown help box shown]
    Help --> Edit{User action?}
    Edit -->|Types changes| Update[Text updates in real-time]
    Edit -->|Press Enter| Save
    Edit -->|Press Escape| Cancel
    Edit -->|Click check icon| Save
    Edit -->|Click X icon| Cancel
    Update --> Edit
    Save{Text valid?}
    Save -->|Empty| Edit
    Save -->|Valid| Apply[Save changes]
    Apply --> Display[Updated text displayed with Markdown rendering]
    Display --> Exit1[Exit edit mode]
    Cancel --> Revert[Discard changes]
    Revert --> Exit2[Exit edit mode]
    Exit1 --> End([Todo updated])
    Exit2 --> End2([No changes made])
    NoEdit --> End3([Edit not available])
```

**User Actions:**

- Click edit button (pencil icon) - desktop
- Long press on todo (500ms) - mobile
- Edit text in textarea
- Save with Enter, check icon, or Cancel with Escape, X icon

**System Behavior:**

- Edit mode only available for active todos
- Markdown help displayed during editing
- Auto-resize textarea based on content
- Markdown rendered after saving
- Changes discarded on cancel

## Delete Todo Flow

```mermaid
flowchart TD
    Start([User wants to delete]) --> Method{Interaction method?}
    Method -->|Click X button| Confirm
    Method -->|Mobile: Swipe left| Confirm
    Confirm[Confirmation dialog appears]
    Confirm --> State{Todo state?}
    State -->|Active/Completed| SoftDelete[Soft delete message]
    State -->|Already deleted| HardDelete[Permanent delete warning]
    SoftDelete --> Dialog1{User choice?}
    Dialog1 -->|Click Delete| Soft[Move to Recently Deleted]
    Dialog1 -->|Click Cancel| Cancel1
    HardDelete --> Dialog2{User choice?}
    Dialog2 -->|Click Permanently Delete| Hard[Remove from storage]
    Dialog2 -->|Click Cancel| Cancel2
    Soft --> Hide[Todo disappears from current view]
    Hide --> Marked[Todo marked as deleted with timestamp]
    Marked --> Trash[Todo appears in Recently Deleted]
    Trash --> End1([Can be restored])
    Hard --> Gone[Todo removed completely]
    Gone --> End2([Cannot be recovered])
    Cancel1 --> End3([No changes made])
    Cancel2 --> End3
```

**User Actions:**

- Click X button on todo
- Swipe left gesture (mobile)
- Confirm or cancel in dialog

**System Behavior:**

- First delete: Soft delete to Recently Deleted
- Second delete: Permanent removal with warning
- Confirmation dialog prevents accidental deletion
- Soft-deleted todos can be restored

## Restore Deleted Todo Flow

```mermaid
flowchart TD
    Start([User in Recently Deleted filter]) --> See[User sees deleted todos]
    See --> Click[User clicks restore button]
    Click --> Restore[Todo restored to active state]
    Restore --> Time[Deleted timestamp cleared]
    Time --> Move[Todo removed from Recently Deleted]
    Move --> Active[Todo appears in active list]
    Active --> End([Todo is active again])
```

**User Actions:**

- Navigate to "Recently Deleted" filter
- Click restore button (curved arrow) on deleted todo

**System Behavior:**

- Todo returns to active state
- Deleted timestamp removed
- Todo moves back to active list
- Appears in original position

## Filter Todos Flow

```mermaid
flowchart TD
    Start([User sees filter buttons]) --> Current{Current filter}
    Current --> Buttons[5 filter options with counts]
    Buttons --> Click{User clicks filter?}
    Click -->|All| ShowAll[Show active + completed todos]
    Click -->|Active| ShowActive[Show only incomplete todos]
    Click -->|Completed| ShowCompleted[Show only completed todos]
    Click -->|Recently Deleted| ShowDeleted[Show only deleted todos]
    Click -->|Activity| ShowTimeline[Show activity timeline view]
    ShowAll --> Update1[Update display]
    ShowActive --> Update2[Update display]
    ShowCompleted --> Update3[Update display]
    ShowDeleted --> Update4[Update display]
    ShowTimeline --> Timeline[Display chronological activity]
    Update1 --> Visual1[Selected button highlighted]
    Update2 --> Visual2[Selected button highlighted]
    Update3 --> Visual3[Selected button highlighted]
    Update4 --> Visual4[Selected button highlighted]
    Timeline --> Visual5[Selected button highlighted]
    Visual1 --> End([Filtered view shown])
    Visual2 --> End
    Visual3 --> End
    Visual4 --> End
    Visual5 --> End
```

**User Actions:**

- Click any of the 5 filter buttons
- Buttons show current count for each category

**Filter Options:**

1. **All**: Active and completed todos (excludes deleted)
2. **Active**: Only incomplete todos
3. **Completed**: Only completed todos
4. **Recently Deleted**: Only soft-deleted todos
5. **Activity**: Chronological timeline of all changes

**System Behavior:**

- Active filter button visually highlighted
- List updates immediately
- Counts update in real-time
- Activity filter shows different view (timeline vs. list)

## Reorder Todos Flow

```mermaid
flowchart TD
    Start([User in active filter]) --> Method{Reorder method?}
    Method -->|Desktop: Drag handle| DragStart
    Method -->|Keyboard: Up/Down buttons| KeyPress
    DragStart[Grab drag handle with grip icon]
    DragStart --> Drag[Drag todo to new position]
    Drag --> Drop[Drop at target position]
    Drop --> Reorder1[Update todo order]
    KeyPress --> Button{Which button?}
    Button -->|Up arrow| MoveUp{Not first?}
    Button -->|Down arrow| MoveDown{Not last?}
    MoveUp -->|Yes| Up[Move todo up one position]
    MoveUp -->|No| Disabled1[Button disabled]
    MoveDown -->|Yes| Down[Move todo down one position]
    MoveDown -->|No| Disabled2[Button disabled]
    Up --> Reorder2[Update todo order]
    Down --> Reorder3[Update todo order]
    Reorder1 --> Save[Persist new order]
    Reorder2 --> Save
    Reorder3 --> Save
    Save --> End([Order updated])
    Disabled1 --> End2([No change])
    Disabled2 --> End2
```

**User Actions:**

- Drag and drop using grip handle (desktop)
- Click up/down chevron buttons
- Only available in active filter

**System Behavior:**

- Drag handle visible in active filter
- Up button disabled for first item
- Down button disabled for last item
- Order persisted to localStorage
- Visual feedback during drag operation

## Overall User Journey

```mermaid
flowchart LR
    Entry([Open App]) --> Add[Add Todos]
    Add --> View[View & Filter]
    View --> Complete[Complete Todos]
    View --> Edit[Edit Todos]
    View --> Reorder[Reorder Todos]
    Complete --> Undo[Undo if needed]
    Edit --> View
    Reorder --> View
    Undo --> View
    View --> Delete[Delete Todos]
    Delete --> Restore[Restore if needed]
    Restore --> View
    Delete --> End([Done])
    Complete --> End
    Undo --> End
```

## List Lifecycle Flow

This diagram shows how users create, share, and access lists (see [ADR-031](../adr/031-list-lifecycle-architecture.md)).

```mermaid
flowchart TD
    Start([User Opens App]) --> HasList{Active list<br/>in session?}
    HasList -->|Yes| TodoApp[Show Todo List]
    HasList -->|No| Landing[Show Landing Page]

    Landing --> Choice{User choice?}
    Choice -->|Create New List| CreateLocal[Create Local List]
    Choice -->|Open Existing| OpenFlow

    CreateLocal --> LocalList[Local List Created]
    LocalList --> LocalMode[Work in Local Mode]
    LocalMode --> TodoApp

    OpenFlow --> Picker[List Picker]
    Picker --> PickerChoice{Selection method?}
    PickerChoice -->|Remembered list| SelectRemembered[Select from list]
    PickerChoice -->|Enter URL| EnterURL[Paste/type list URL]

    SelectRemembered --> LoadShared[Load Shared List]
    EnterURL --> ValidateURL{URL valid?}
    ValidateURL -->|Yes| LoadShared
    ValidateURL -->|No| ErrorMsg[Show error message]
    ErrorMsg --> Picker

    LoadShared --> SharedMode[Work in Shared Mode]
    SharedMode --> TodoApp

    TodoApp --> WorkFlow{User action?}
    WorkFlow -->|Add/Edit/Complete todos| TodoApp
    WorkFlow -->|Share local list| ShareAction

    ShareAction --> GenerateID[Generate unique list ID]
    GenerateID --> SaveKV[Save to Vercel KV]
    SaveKV --> GetURL[Generate shareable URL]
    GetURL --> ShowURL[Show URL to user]
    ShowURL --> Remember[Add to remembered lists]
    Remember --> SharedMode
```

**Entry Points:**

1. **Create New List** → Local ephemeral list (in-memory only)
2. **Open Existing** → Remembered lists or manual URL entry

**List Types:**

| Type   | Storage   | Persistence  | Collaboration   |
| ------ | --------- | ------------ | --------------- |
| Local  | In-memory | Session only | Single user     |
| Shared | Vercel KV | Permanent    | Anyone with URL |

**Sharing Flow:**

1. User works on local list
2. Clicks "Share" action
3. System generates unique list ID
4. Todos saved to Vercel KV
5. User receives shareable URL
6. List added to remembered lists
7. Real-time sync enabled

**Remembered Lists:**

- Stored in localStorage
- Shown in "Open Existing" picker
- Tracks listId, name, lastAccessed, isOwner
