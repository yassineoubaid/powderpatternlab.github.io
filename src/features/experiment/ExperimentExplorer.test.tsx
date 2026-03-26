import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';

import ExperimentExplorer from './ExperimentExplorer';

describe('ExperimentExplorer', () => {
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

    scrollIntoView.mockClear();
    await userEvent.click(screen.getByRole('button', { name: /continue to cell setup/i }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
  });

  it('resets the experiment when launch is clicked again', async () => {
    render(<ExperimentExplorer />);

    await userEvent.click(screen.getByRole('button', { name: /try nacl demo/i }));
    const continueButton = screen.getByRole('button', { name: /continue to symmetry/i });
    await waitFor(() => expect(continueButton).toBeEnabled());

    await userEvent.click(screen.getByRole('button', { name: /launch the experiment/i }));

    expect(screen.getByPlaceholderText('Si')).toHaveValue('');
    expect(screen.getByRole('button', { name: /continue to symmetry/i })).toBeDisabled();
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
});
