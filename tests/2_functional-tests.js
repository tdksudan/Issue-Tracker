const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const project = 'test-project';

  suite('POST /api/issues/{project}', function () {
    test('Create an issue with every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/' + project)
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test text with all fields',
          created_by: 'Sudan',
          assigned_to: 'Tester Bot',
          status_text: 'In Progress'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');
          assert.equal(res.body.issue_title, 'Test Title');
          assert.equal(res.body.issue_text, 'Test text with all fields');
          assert.equal(res.body.created_by, 'Sudan');
          assert.equal(res.body.assigned_to, 'Tester Bot');
          assert.equal(res.body.status_text, 'In Progress');
          assert.isTrue(res.body.open);
          done();
        });
    });
    test("Create an issue with only required fields",function (done) {
      chai.request(server)
        .post("/api/issues/"+project)
        .send({
          issue_title: "Required Only",
          issue_text: "Testing minimal fields",
          created_by: "Tester"
        })
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.body.assigned_to,"");
          assert.equal(res.body.status_text,"");
          done();
        });
    });
    test("Create an issue with missing required fields",function (done){
      chai.request(server)
        .post("/api/issues/"+project)
        .send({
          issue_title:"",
          issue_text: "",
          created_by: ""
        })
        .end(function (err, res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'required fields missing'});
          done();
        });
    });
  });
});