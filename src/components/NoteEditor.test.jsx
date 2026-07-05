import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import NoteEditor from './NoteEditor';

const { useEditor: mockUseEditor } = vi.hoisted(() => {
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
  };
  return { useEditor: vi.fn(() => editor) };
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
    vi.clearAllMocks();
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
      };
    });

    renderWithI18n(<NoteEditor {...defaultProps} onUpdate={onUpdate} />);

    capturedOnUpdate({ editor: { getHTML: () => '<p>updated</p>' } });
    expect(onUpdate).toHaveBeenCalledWith('<p>updated</p>');
  });

  it('returns null when editor is not ready', () => {
    mockUseEditor.mockReturnValueOnce(null);
    const { container } = renderWithI18n(<NoteEditor {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });
});
