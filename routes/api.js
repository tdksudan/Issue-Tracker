'use strict';
const mongoose = require('mongoose');
const Issue = require('../issue'); // flat schema with a `project` field

module.exports = function (app) {
  app.route('/api/issues/:project')

    // GET: view all issues or filter
    .get(async function (req, res) {
      const project = req.params.project;
      const filters = { ...req.query, project };

      try {
        const issues = await Issue.find(filters);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'could not retrieve issues' });
      }
    })

    // POST: create an issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });

      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.status(500).json({ error: 'could not create issue' });
      }
    })

    // PUT: update issue
    .put(async function (req, res) {
      const project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '')
      );

      if (Object.keys(filteredUpdates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not update', _id });
      }

      filteredUpdates.updated_on = new Date();

      try {
        const updated = await Issue.findOneAndUpdate({ _id, project }, filteredUpdates, { new: true });

        if (!updated) {
          return res.json({ error: 'could not update', _id });
        }

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.status(500).json({ error: 'could not update', _id });
      }
    })

    // DELETE: remove an issue
    .delete(async function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'Invalid id', _id });
      }

      try {
        const deleted = await Issue.findOneAndDelete({ _id, project });

        if (!deleted) {
          return res.json({ error: 'could not delete', _id });
        }

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.status(500).json({ error: 'could not delete', _id });
      }
    });
};