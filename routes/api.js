'use strict';

module.exports = function (app) {

  app.route('/api/issues/:project')
     
  //Get all issues or filter by query parameters
    .get(async function (req, res){
      let project = req.params.project;
      try{
        const filters = req.query;
        const issues = await Issue.find({ project, ...filters });
        res.json(issues);
      } catch (error){
        res.status(500).json({error: 'could not retrieve issues'});
      }
    })
    
  //Create a new issue
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to ='',status_text=''}=req.body;

      if (!issue_title || !issue_text || !created_by){
        return res.status(200).json({
          error: 'required fields missing'
        });
      }
        try {
          const newIssue = new Issue ({
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
          await newIssue.save();
          res.json(newIssue);

        }catch (error){
          res.status(500).json({ error:"could not create issue"});
        }
      
    })
  //Update an issue
    .put(async function (req, res){
      let project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id){
        return res.json({
          error: 'missing _id'
        });
      }
      
      if(Object.keys(updates).length===0) {
        return res.json({ error: "no update field(s) sent", _id});
      }

      try {
        updates.updated_on = new Date();
        const updatedIssue = await Issue.findOneAndUpdate({ _id,project}, updates, { new:true });

        if(!updatedIssue){
          return res.json({ error: 'could not update', _id});
        }

        res.json({result:'sucessfully updated', _id});
      } catch (error){
        res.status(500).json({ error: 'could not update', _id});
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const {_id} = req.body;

      if(!_id){
        return res.json ({
          error: 'missing _id'
        });
      }  
      
      try{
        const deletedIssue = await Issue.findOneAndDelete({ _id, project});

        if(!deletedIssue){
          return res.json({ error: 'could not delete', _id});
        }

        res.json({ result: 'successfully deleted', _id
        });

      }catch (error) {
        res.status(500).json({ error: 'could not delete', _id});
      }
    });
    
};
