import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import NoteEditor from './NoteEditor';

const { useEditor: mockUseEditor, defaultEditor } = vi.hoisted(() => {
  const editor = {
    isActive: vi.fn(() => false),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
        toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    getHTML: vi.fn(() => '<p>initial</p>'),
    commands: { setContent: vi.fn() },
    view: { state: { doc: {} } },
  };
  return { useEditor: vi.fn(() => editor), defaultEditor: editor };
});

vi.mock('@tiptap/react', () => ({
  useEditor: mockUseEditor,
  EditorContent: () => null,
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

describe('NoteEditor', () => {
  const defaultProps = {
    content: '<p>hello</p>',
    placeholder: 'Write your notes...',
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseEditor.mockReturnValue(defaultEditor);
  });

  it('renders toolbar buttons', () => {
    renderWithI18n(<NoteEditor {...defaultProps} />);

    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Bullet list')).toBeInTheDocument();
    expect(screen.getByLabelText('Numbered list')).toBeInTheDocument();
    expect(screen.getByLabelText('Heading')).toBeInTheDocument();
  });

  it('calls useEditor with content and placeholder', () => {
    renderWithI18n(<NoteEditor {...defaultProps} />);

    expect(mockUseEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '<p>hello</p>',
        editorProps: expect.objectContaining({
          attributes: expect.objectContaining({
            dir: 'auto',
          }),
        }),
      })
    );
  });

  it('calls onUpdate when editor emits change', () => {
    const onUpdate = vi.fn();
    let capturedOnUpdate;

    mockUseEditor.mockImplementation(config => {
      capturedOnUpdate = config.onUpdate;
      return {
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({
            toggleBold: vi.fn(() => ({ run: vi.fn() })),
            toggleItalic: vi.fn(() => ({ run: vi.fn() })),
            toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
            toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
            toggleHeading: vi.fn(() => ({ run: vi.fn() })),
          })),
        })),
        getHTML: vi.fn(() => '<p>updated</p>'),
        commands: { setContent: vi.fn() },
        view: { state: { doc: {} } },
      };
    });

    renderWithI18n(<NoteEditor {...defaultProps} onUpdate={onUpdate} />);

    capturedOnUpdate({
      editor: { getHTML: () => '<p>updated</p>', view: { state: { doc: {} } } },
    });
    expect(onUpdate).toHaveBeenCalledWith('<p>updated</p>');
  });

  it('returns null when editor is not ready', () => {
    mockUseEditor.mockReturnValueOnce(null);
    const { container } = renderWithI18n(<NoteEditor {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls setContent on mount when prop content differs from editor HTML', () => {
    renderWithI18n(<NoteEditor {...defaultProps} />);
    const editorInstance = mockUseEditor.mock.results[0].value;
    expect(editorInstance.commands.setContent).toHaveBeenCalledWith(
      '<p>hello</p>',
      { emitUpdate: false }
    );
  });

  it('does not call setContent when prop content matches editor HTML', () => {
    const matchedEditor = {
      isActive: vi.fn(() => false),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({
          toggleBold: vi.fn(() => ({ run: vi.fn() })),
          toggleItalic: vi.fn(() => ({ run: vi.fn() })),
          toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
          toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
          toggleHeading: vi.fn(() => ({ run: vi.fn() })),
        })),
      })),
      getHTML: vi.fn(() => '<p>hello</p>'),
      commands: { setContent: vi.fn() },
      view: { state: { doc: {} } },
    };
    mockUseEditor.mockReturnValueOnce(matchedEditor);
    renderWithI18n(
      <NoteEditor
        content="<p>hello</p>"
        placeholder="Write..."
        onUpdate={vi.fn()}
      />
    );
    expect(matchedEditor.commands.setContent).not.toHaveBeenCalled();
  });

  it('applies active styles when tool button is active', () => {
    const activeEditor = {
      isActive: vi.fn(() => true),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({
          toggleBold: vi.fn(() => ({ run: vi.fn() })),
          toggleItalic: vi.fn(() => ({ run: vi.fn() })),
          toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
          toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
          toggleHeading: vi.fn(() => ({ run: vi.fn() })),
        })),
      })),
      getHTML: vi.fn(() => '<p>initial</p>'),
      commands: { setContent: vi.fn() },
      view: { state: { doc: {} } },
    };
    mockUseEditor.mockReturnValueOnce(activeEditor);
    renderWithI18n(<NoteEditor {...defaultProps} />);
    const boldButton = screen.getByLabelText('Bold');
    expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    const className = boldButton.className;
    expect(className).toContain('bg-theme-primary-light');
  });

  it('calls toggleHeading when heading button is clicked', () => {
    const toggleHeadingMock = vi.fn(() => ({ run: vi.fn() }));
    const headingEditor = {
      isActive: vi.fn(() => false),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({
          toggleBold: vi.fn(() => ({ run: vi.fn() })),
          toggleItalic: vi.fn(() => ({ run: vi.fn() })),
          toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
          toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
          toggleHeading: toggleHeadingMock,
        })),
      })),
      getHTML: vi.fn(() => '<p>initial</p>'),
      commands: { setContent: vi.fn() },
      view: { state: { doc: {} } },
    };
    mockUseEditor.mockReturnValueOnce(headingEditor);
    renderWithI18n(<NoteEditor {...defaultProps} />);
    screen.getByLabelText('Heading').click();
    expect(toggleHeadingMock).toHaveBeenCalledWith({ level: 2 });
  });

  it('skips onUpdate when editor ProseMirror state is not ready', () => {
    const onUpdate = vi.fn();
    let capturedOnUpdate;

    mockUseEditor.mockImplementation(config => {
      capturedOnUpdate = config.onUpdate;
      return {
        isActive: vi.fn(() => false),
        chain: vi.fn(() => ({
          focus: vi.fn(() => ({
            toggleBold: vi.fn(() => ({ run: vi.fn() })),
            toggleItalic: vi.fn(() => ({ run: vi.fn() })),
            toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
            toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
            toggleHeading: vi.fn(() => ({ run: vi.fn() })),
          })),
        })),
        getHTML: vi.fn(() => '<p>test</p>'),
        commands: { setContent: vi.fn() },
        view: { state: null },
      };
    });

    renderWithI18n(<NoteEditor {...defaultProps} onUpdate={onUpdate} />);
    capturedOnUpdate({
      editor: { getHTML: () => '<p>updated</p>', view: { state: null } },
    });
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('skips content sync when editor ProseMirror state is not ready', () => {
    const notReadyEditor = {
      isActive: vi.fn(() => false),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({
          toggleBold: vi.fn(() => ({ run: vi.fn() })),
          toggleItalic: vi.fn(() => ({ run: vi.fn() })),
          toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
          toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
          toggleHeading: vi.fn(() => ({ run: vi.fn() })),
        })),
      })),
      getHTML: vi.fn(() => '<p>initial</p>'),
      commands: { setContent: vi.fn() },
      view: { state: null },
    };
    mockUseEditor.mockReturnValueOnce(notReadyEditor);
    renderWithI18n(<NoteEditor {...defaultProps} />);
    expect(notReadyEditor.commands.setContent).not.toHaveBeenCalled();
  });
});
