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
          created_by: 'XYZ',
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
          assert.equal(res.body.created_by, 'XYZ');
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
          assert.deepEqual(res.body, { error: 'required field(s) missing'});
          done();
        });
    });

  });
  suite('GET /api/issues/{project}',function(){
     test('View issues on a Project',function(done){
      chai
        .request(server)
        .get('/api/issues/test-project')
        .end(function (err,res) {
          assert.equal(res.status,200);
          assert.isArray(res.body);
          if (res.body.length > 0){
            const issue = res.body[0];
            assert.property(issue, "_id");
            assert.property(issue, "issue_title");
            assert.property(issue, "issue_text");
            assert.property(issue, "created_by");
            assert.property(issue, "status_text");
            assert.property(issue, "created_on");
            assert.property(issue, "updated_on");
            assert.property(issue, "open");
          }
          done();
        });
     });
     test("View issues on a project with one filter",function(done){
        chai
          .request(server)
          .get("/api/issues/test-project?open=true")
          .end(function (err,res){
            assert.equal(res.status,200)
            assert.isArray(res.body);
            res.body.forEach(issue => {
                assert.property(issue, "_id");
                assert.property(issue, "issue_title");
                assert.property(issue, "issue_text");
                assert.property(issue, "created_by");
                assert.property(issue, "open");
                assert.equal(issue.open, true);
            });
            done();
          });
           
     });
     test("View issues on a project with multiple filters",function(done){
      chai 
       .request(server)
       .get("/api/issues/test-project?open=true&created_by=XYZ")
       .end(function(err,res) {
          assert.equal(res.status,200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.property(issue,'open');
            assert.property(issue,'created_by');
            assert.equal(issue.open, true);
            assert.equal(issue.created_by, 'XYZ');
          });
          done();
       });
     });
  });
  suite(' PUT /api/issues/{project}',function(){
    test('Update one field on an issue',function(done){
      chai 
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: '68521a3eef8cd8d3a470d737',
          issue_title: 'Updated Title'
        })
        .end(function (err,res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {result: 'successfully updated',_id: '68521a3eef8cd8d3a470d737'});
          done();
        })
    });
    test('Update multiple fields on an issue',function(done){
      chai 
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: '68521a3eef8cd8d3a470d737',
          issue_title: 'Updated Title',
          status_text: 'In Progress'

        })
        .end(function(err,res){
          assert.equal(res.status,(200))
          assert.deepEqual(res.body, { result: 'successfully updated', _id: '68521a3eef8cd8d3a470d737'})
          done();
        });
    });
    test('Update an issue with missing _id',function(done){
      chai 
       .request(server)
       .put('/api/issues/test-project')
       .send({
          issue_title: 'This should fail'
       })
       .end(function(err,res){
        assert.equal(res.status,200)
        assert.deepEqual(res.body,{error:"missing _id"});
        done();
       });
    });
    test('Update an issue with no fields to update',function(done){
      chai 
       .request(server)
       .put('/api/issues/test-project')
       .send({
         _id:'68521a3eef8cd8d3a470d737'
       })
       .end(function (err, res){
        assert.equal (res.status, 200)
        assert.deepEqual (res.body, {
          error: 'no update field(s) sent',
          _id: "68521a3eef8cd8d3a470d737"
        });
        done();
       });
    });
    test('Update an issue with an invalid _id',function(done){
       chai 
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: 'invalidid123',
          issue_title: 'Should not update'
        })
        .end(function(err,res){
          assert.equal(res.status, 500);
          assert.deepEqual(res.body, {
            error: 'could not update',
            _id: 'invalidid123'
          });
          done();
        });
    });
  });
  suite(' DELETE /api/issues/{project}',function(){
     test('Delete an issue',function(done){
       chai
        .request(server)
        .delete('/api/issues/test-project')
        .send({
          _id: '6852199c3fd36f6c43a562a1'
        })
        .end(function (err, res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            result: 'successfully deleted',
            _id: '6852199c3fd36f6c43a562a1'
          });
          done();
        });
     });
     test('Delete an issue with an invalid _id',function(done){
       chai
         .request(server)
         .delete('/api/issues/test-project')
         .send({
           _id: 'invalidid123'
         })
         .end(function (err,res){
          assert.equal(res.status, 500);
          assert.deepEqual(res.body, {
            error: 'could not delete',
            _id: 'invalidid123'
          });
          done();
         });
     });
     test('Delete an issue with missing_id',function(done){
      chai 
       .request(server)
       .delete('/api/issues/test-project')
       .send({})
       .end(function(err,res){
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
       });
     });
  });
});