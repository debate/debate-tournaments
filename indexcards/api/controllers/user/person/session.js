import { NotFound } from '../../../helpers/problem.js';

export async function getSession(req, res) {
	if(req.session) {
		return res.status(200).json(req.session);
	}
	return NotFound(req,res, 'You have no active user session.');
}
