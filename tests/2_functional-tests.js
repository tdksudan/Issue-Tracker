const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

let createdId;

suite('Functional Tests', function () {
  const project = 'fcc-project';

  suite('POST /api/issues/{project}', function () {
    test('Create an issue with every field', function (done) {
      chai.request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: 'Title A',
          issue_text: 'Text A',
          created_by: 'FCC',
          assigned_to: 'Me',
          status_text: 'Open'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Title A');
          assert.equal(res.body.issue_text, 'Text A');
          assert.equal(res.body.created_by, 'FCC');
          assert.equal(res.body.assigned_to, 'Me');
          assert.equal(res.body.status_text, 'Open');
          assert.isTrue(res.body.open);
          createdId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function (done) {
      chai.request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: 'Title B',
          issue_text: 'Text B',
          created_by: 'FCC'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', function (done) {
      chai.request(server)
        .post(`/api/issues/${project}`)
        .send({
          issue_title: '',
          issue_text: '',
          created_by: ''
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'required field(s) missing' });
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function () {
    test('View issues on a project', function (done) {
      chai.request(server)
        .get(`/api/issues/${project}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          const issue = res.body[0] || {};
          assert.property(issue, 'issue_title');
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          done();
        });
    });

    test('View issues on a project with one filter', function (done) {
      chai.request(server)
        .get(`/api/issues/${project}?open=true`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.open, true);
          });
          done();
        });
    });

    test('View issues on a project with multiple filters', function (done) {
      chai.request(server)
        .get(`/api/issues/${project}?open=true&created_by=FCC`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.open, true);
            assert.equal(issue.created_by, 'FCC');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function () {
    test('Update one field on an issue', function (done) {
      chai.request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: '685226b980202a153a9c590a',
          issue_title: 'Updated Title'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: '685226b980202a153a9c590a' });
          done();
        });
    });

    test('Update multiple fields on an issue', function (done) {
      chai.request(server)
        .put(`/api/issues/${project}`)
        .send({
          _id: '685226b980202a153a9c590a',
          issue_title: 'Updated Again',
          issue_text: 'Updated Text'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', _id: '685226b980202a153a9c590a' });
          done();
        });
    });

    test('Update an issue with missing _id', function (done) {
      chai.request(server)
        .put(`/api/issues/${project}`)
        .send({ issue_title: 'No ID' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    });

    test('Update an issue with no fields to update', function (done) {
      chai.request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: '68521a3eef8cd8d3a470d737' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: '68521a3eef8cd8d3a470d737' });
          done();
        });
    });

    test('Update an issue with an invalid _id', function (done) {
      chai.request(server)
        .put(`/api/issues/${project}`)
        .send({ _id: '123invalidid', issue_text: 'Fail' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not update', _id: '123invalidid' });
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function () {
    test('Delete an issue', function (done) {
      chai.request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: '685226da3fe8b6893a1ddebe' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully deleted', _id: '685226da3fe8b6893a1ddebe' });
          done();
        });
    });

    test('Delete an issue with an invalid _id', function (done) {
      chai.request(server)
        .delete(`/api/issues/${project}`)
        .send({ _id: 'invalid123' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid id', _id: 'invalid123' });
          done();
        });
    });

    test('Delete an issue with missing _id', function (done) {
      chai.request(server)
        .delete(`/api/issues/${project}`)
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
    });
  });
});