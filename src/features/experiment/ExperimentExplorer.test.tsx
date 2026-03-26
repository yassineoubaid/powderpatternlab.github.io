import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';

import ExperimentExplorer from './ExperimentExplorer';

describe('ExperimentExplorer', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '#home');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the experiment step locked until the structure is valid', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /launch the experiment/i }));

    expect(screen.getByText(/level 1: build the recipe/i)).toBeInTheDocument();
    const patternStep = screen.getByRole('button', { name: /3\. pattern/i });
    expect(patternStep).toBeDisabled();
  });

  it('scrolls back to the scene when moving to the next lesson page', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    scrollIntoView.mockClear();

    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    await waitFor(() => expect(window.location.hash).toBe('#symmetry-lattice'));

    scrollIntoView.mockClear();
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    await waitFor(() => expect(window.location.hash).toBe('#symmetry-cell'));
  });

  it('resets the experiment when launch is clicked again', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    const continueButton = screen.getByRole('button', { name: /continue to symmetry/i });
    await waitFor(() => expect(continueButton).toBeEnabled());

    await userEvent.click(screen.getByRole('button', { name: /launch the experiment/i }));

    expect(screen.getByPlaceholderText('Si')).toHaveValue('');
    expect(screen.getByRole('button', { name: /continue to symmetry/i })).toBeDisabled();
    await waitFor(() => expect(window.location.hash).toBe('#formula'));
  });

  it('opens rigorous glossary details for scientific terms', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));

    await userEvent.click(screen.getByRole('button', { name: /^space group$/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/a space group is the full symmetry description/i)).toBeInTheDocument();
    expect(screen.getByText(/g = \(r \| t\)/i)).toBeInTheDocument();
  });

  it('switches between english, french, and arabic from the top-right language controls', async () => {
    render(<ExperimentExplorer />);

    expect(screen.getByRole('heading', { name: /let's start our diffraction experiment/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'FR' }));
    expect(
      screen.getByRole('heading', { name: /commençons notre expérience de diffraction/i }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'AR' }));
    expect(screen.getByRole('heading', { name: /لنبدأ تجربة الحيود الخاصة بنا/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ENG' }));
    expect(screen.getByRole('heading', { name: /let's start our diffraction experiment/i })).toBeInTheDocument();
  });

  it('supports route tracing and browser back between lesson pages', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    await waitFor(() => expect(window.location.hash).toBe('#formula'));

    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await waitFor(() => expect(window.location.hash).toBe('#symmetry-lattice'));

    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));
    await waitFor(() => expect(window.location.hash).toBe('#symmetry-cell'));

    window.history.back();

    await waitFor(() => expect(window.location.hash).toBe('#symmetry-lattice'));
    expect(
      screen.getByRole('button', { name: /1\. bravais lattice/i }),
    ).toHaveClass('is-active');
  });

  it('adds physical min, max, and step values to the scientific inputs', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));

    const xCoordinate = screen.getByLabelText(/atom 1 x coordinate/i);
    expect(xCoordinate).toHaveAttribute('min', '0');
    expect(xCoordinate).toHaveAttribute('max', '1');
    expect(xCoordinate).toHaveAttribute('step', '0.001');

    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));

    const aCell = screen.getByLabelText(/^a \(a\)$/i);
    expect(aCell).toHaveAttribute('min', '0.5');
    expect(aCell).toHaveAttribute('max', '20');
    expect(aCell).toHaveAttribute('step', '0.01');

    await userEvent.click(screen.getByRole('button', { name: /continue to experiment/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to wavelength/i }));

    const wavelength = screen.getByLabelText(/wavelength lambda \(a\)/i);
    expect(wavelength).toHaveAttribute('min', '0.1');
    expect(wavelength).toHaveAttribute('max', '10');
    expect(wavelength).toHaveAttribute('step', '0.0001');

    await userEvent.click(screen.getByRole('button', { name: /continue to resolution/i }));

    const uResolution = screen.getByLabelText(/^u$/i);
    expect(uResolution).toHaveAttribute('min', '0');
    expect(uResolution).toHaveAttribute('max', '2');
    expect(uResolution).toHaveAttribute('step', '0.001');

    const vResolution = screen.getByLabelText(/^v$/i);
    expect(vResolution).toHaveAttribute('min', '-2');
    expect(vResolution).toHaveAttribute('max', '2');
    expect(vResolution).toHaveAttribute('step', '0.001');
  });

  it('clamps oversized lattice values before they can freeze the live simulation', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));

    const aCell = screen.getByLabelText(/^a \(a\)$/i);
    fireEvent.change(aCell, { target: { value: '70' } });

    expect(aCell).toHaveValue(20);
  });

  it('guides a demo structure all the way to the powder pattern', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));

    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));

    const continueButton = await screen.findByRole('button', {
      name: /continue to experiment/i,
    });
    await waitFor(() => expect(continueButton).toBeEnabled());
    await userEvent.click(continueButton);

    await userEvent.click(screen.getByRole('button', { name: /continue to wavelength/i }));
    expect(screen.getByText(/simulation window: 5 deg to 160 deg/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /continue to resolution/i }));
    await userEvent.click(screen.getByRole('button', { name: /show the pattern/i }));

    expect(
      await screen.findByRole('heading', { name: /let's see what it gives experimentally/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/level 3: fire the beam/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ideal bragg sticks/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/broadened powder profile/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/most visible reflections/i)).toBeInTheDocument();

    const plotViewport = screen.getByLabelText(/interactive powder plot viewport/i);
    expect(screen.getByText(/view: 5\.0-160\.0 deg\./i)).toBeInTheDocument();
    expect(screen.getByText(/zoom: 100%/i)).toBeInTheDocument();

    fireEvent.wheel(plotViewport, { deltaY: -120, clientX: 180 });
    await waitFor(() =>
      expect(screen.queryByText(/view: 5\.0-160\.0 deg\./i)).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: /reset view/i }));
    await waitFor(() => expect(screen.getByText(/view: 5\.0-160\.0 deg\./i)).toBeInTheDocument());
  });

  it('finishes the experiment by clearing the state and returning home', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to symmetry/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to experiment/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to wavelength/i }));
    await userEvent.click(screen.getByRole('button', { name: /continue to resolution/i }));
    await userEvent.click(screen.getByRole('button', { name: /show the pattern/i }));
    scrollIntoView.mockClear();

    await userEvent.click(screen.getByRole('button', { name: /finish experiment/i }));

    await waitFor(() => expect(window.location.hash).toBe('#home'));
    expect(screen.queryByRole('button', { name: /1\. formula/i })).not.toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /launch the experiment/i }));
    expect(screen.getByPlaceholderText('Si')).toHaveValue('');
  });
});
