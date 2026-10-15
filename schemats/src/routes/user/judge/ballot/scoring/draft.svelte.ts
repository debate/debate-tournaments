import type { DebateBallotContext, DebateBallotSubmission } from '@tabroom/types';

// The scores part of PUT /ballots; the layout adds the feedback
export type DebateScores = Omit<DebateBallotSubmission, 'feedback'>;

/**
 * What the judge has entered on a debate ballot, seeded from the saved scores.
 * Made once per page, so a context reload (a coin flip changing the sides) keeps it. */
export class DebateDraft {
	winner = $state<number | null>(null);
	// The side the judge says the winner was on: 1 for Aff, 2 for Neg. Checked against the winner's side
	side = $state<number | null>(null);
	lowPointWin = $state(false);
	// Speaker points by student id, null while blank
	points = $state<Record<number, number | null>>({});

	constructor(context: DebateBallotContext) {
		this.winner = context.debate.winner;
		this.side = context.Entries.find((entry) => entry.ballot === context.debate.winner)?.side ?? null;
		this.points = Object.fromEntries(
			context.Entries.flatMap((entry) => entry.Students).map((student) => [student.id, student.points])
		);
	}

	/** The scores to submit, as entered. The server checks them */
	toScores(context: DebateBallotContext): DebateScores {
		return {
			eventType: 'debate',
			winner: this.winner,
			winnerSide: this.side,
			lowPointWin: this.lowPointWin,
			points: context.scoring.points
				? context.Entries.flatMap((entry) => entry.Students).map((student) => ({
					student: student.id,
					points: this.points[student.id] ?? null,
				}))
				: [],
		};
	}
}
