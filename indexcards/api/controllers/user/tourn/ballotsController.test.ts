import con from './ballotsController.js';
import panelRepo from '../../../repos/panelRepo.js';
import { createPersonContext } from '../../../../tests/httpMocks.js';

vi.mock('../../../repos/panelRepo.js');


describe('getCurrent', () => {
	it('should not return unpublished rounds', async () => {
		// Mock data
		const mockBallots = [
			{ Round: { published: false, settings: { judges_ballots_visible: false } } },
		];
		vi.spyOn(panelRepo, 'getCurrentBallots').mockResolvedValueOnce(mockBallots);

		// Mock request and response
		const {req, res } = createPersonContext({
			id: 123,
			first: 'Test',
			last: 'User',
			email: 'test@example.com',	
			site_admin: 0,
		 });

		// Call the controller function
		await con.getCurrent(req, res);

		// Assertions
		expect(res).not.toBeProblemResponse();
		expect(res.body).toEqual([]);
	});
	it('returns published rounds, and unpublished rounds released to judges only', async () => {
		// Classic's rule: published, or judges_ballots_visible ("Publish ballots but not schematic")
		const panel = (id: number, published: boolean, judgesBallotsVisible: boolean) => ({
			Round: {
				start: new Date().toISOString(),
				end: new Date(Date.now() + 3600000).toISOString(),
				published,
				flighted: 0,
				settings: { judges_ballots_visible: judgesBallotsVisible },
			},
			Ballots: [{ audit: 0, entry: 1, side: 1, speakerOrder: null }],
			Judge: { Category: { Tourn: { settings: { legion: 0 } }, Event: { type: 'debate', settings: { online_mode: 'sync' } } } },
			Room: { id: 1, name: 'Room A' },
			settings: { flip_status: null, show_async: 0 },
			scored: false,
			id,
			flight: 1,
			Entries: [{ id: 1, code: 'AA' }],
		});
		vi.spyOn(panelRepo, 'getCurrentBallots').mockResolvedValueOnce([
			panel(1, true, false),
			panel(2, false, true),
			panel(3, false, false),
		]);

		const { req, res } = createPersonContext({ id: 123, first: 'Test', last: 'User', email: 'test@example.com', site_admin: 0 }, {});
		await con.getCurrent(req, res);

		expect(res).not.toBeProblemResponse();
		expect((res.body as Array<{ id: number }>).map(ballot => ballot.id)).toEqual([1, 2]);
	});
	it('should correctly return a flighted round', async () => {
		// Mock data
		const roundStart = new Date();
		const offset = 50;
		const mockBallots = [
			{ 
				Round: { 
					start: roundStart.toISOString(),
					end: new Date(Date.now() + 3600000).toISOString(),
					published: true,
					flighted: 1, 
					settings: {
						judges_ballots_visible: 1
					}
				},
				Ballots: [{audit: 0}],
				Judge: {
					Category: {
						Tourn: { settings: { legion: 0 } },
						Event: {
							type: 'debate',
							settings: {
								flight_offset: offset,
								online_mode: 'sync',
								start_button: 'Start Debate',
								start_button_text: 'Please start your debate'
							}
						}
					}
				},
				Room: { id: 1, name: 'Room A' },
				Timeslot: { start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString() },
				start: new Date().toISOString(),
				end: new Date(Date.now() + 3600000).toISOString(),
				settings: {
					flip_status: 0,
					show_async: 1
				},
				scored: false,
				id: 1,
				flight: 2,
				Entries: [],
		},
		];
		vi.spyOn(panelRepo, 'getCurrentBallots').mockResolvedValueOnce(mockBallots);

		// Mock request and response
		const {req, res } = createPersonContext({ id: 123, first: 'Test', last: 'User', email: 'test@example.com', site_admin: 0 },{});

		// Call the controller function
		await con.getCurrent(req, res);

		// Assertions
		expect(res).not.toBeProblemResponse();
		//expect(res.body).toMatchSchema(z.array(CurrentBallot));
		const returnedBallot = (res.body as Array<{ flight: number; start: string; deadline: string; status: string }>)[0];
		expect(returnedBallot.flight).toBe(2);
		expect(returnedBallot.start).toBeDefined();
		expect(returnedBallot.start).toEqual(new Date(roundStart.getTime() + offset * 60_000).toISOString());
		expect(returnedBallot.deadline).toBeDefined();
		expect(returnedBallot.status).toBe('not_started');
	});
	it('should label sides unless a flip is incomplete', async () => {
		const panel = (flipStatus: string | null) => ({
			Round: {
				start: new Date().toISOString(),
				end: new Date(Date.now() + 3600000).toISOString(),
				published: true,
				flighted: 0,
				settings: { judges_ballots_visible: 1 },
			},
			Ballots: [
				{ audit: 0, entry: 1, side: 1, speakerOrder: null },
				{ audit: 0, entry: 2, side: 2, speakerOrder: null },
			],
			Judge: {
				Category: {
					Tourn: { settings: { legion: 0 } },
					Event: { type: 'debate', settings: { online_mode: 'sync', aff_label: 'Pro', neg_label: null } },
				},
			},
			Room: { id: 1, name: 'Room A' },
			settings: { flip_status: flipStatus, show_async: 0 },
			scored: false,
			id: 1,
			flight: 1,
			Entries: [{ id: 1, code: 'AA' }, { id: 2, code: 'BB' }],
		});
		vi.spyOn(panelRepo, 'getCurrentBallots').mockResolvedValueOnce([panel(null), panel('done'), panel('winner')]);

		const { req, res } = createPersonContext({ id: 123, first: 'Test', last: 'User', email: 'test@example.com', site_admin: 0 }, {});
		await con.getCurrent(req, res);

		expect(res).not.toBeProblemResponse();
		const sides = (res.body as Array<{ Entries: { side: string | null }[] }>)
			.map(ballot => ballot.Entries.map(entry => entry.side));
		expect(sides).toEqual([['Pro', 'Neg'], ['Pro', 'Neg'], [null, null]]);
	});
});
