'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');

const uri = 'mongodb+srv://Developer:' + process.env.PW + '@freecodecamp.mxzeiwy.mongodb.net/issue_tracker?retryWrites=true&w=majority';

module.exports = function (app) {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    project: String
  });

  const Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')
    .get(function (req, res) {
      const project = req.params.project;
      const filterObject = req.query;
      filterObject.project = project;
      Issue.find(filterObject, (error, arrayOfResults) => {
        if (!error && Array.isArray(arrayOfResults)) {
          return res.status(200).json(arrayOfResults);
        } else if (error) {
          console.error(error);
          return res.status(500).json('Error retrieving the issues');
        } else {
          return res.status(200).json([]);
        }
      });
    })
    .post(function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json('Required fields missing from request');
      }

      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        project
      });

      newIssue.save()
        .then(savedIssue => {
          if (savedIssue) {
            return res.json(savedIssue);
          }
        })
        .catch(error => {
          console.error(error);
          return res.status(500).json('Error saving the issue');
        });
    })
    
    .put(function (req, res) {
      const { project } = req.params;
      const { _id, ...updateObject } = req.body;
    
      if (Object.keys(updateObject).length === 0) {
        return res.json('no updated field sent');
      }
    
      updateObject.updated_on = new Date();
    
      Issue.findByIdAndUpdate(
        _id,
        { $set: updateObject }, // Usar o operador $set para atualizar os campos especificados
        { new: true },
        (error, updatedIssue) => {
          if (!error && updatedIssue) {
            return res.json('successfully updated');
          } else if (!updatedIssue) {
            return res.json('could not update ' + _id);
          } else {
            console.error(error);
            return res.status(500).json('Error updating the issue');
          }
        }
      );
    })
    

    .delete(function (req, res) {
      const { _id } = req.params;

      if (!_id) {
        return res.json('id error');
      }

      Issue.findByIdAndRemove(_id, (error, deletedIssue) => {
        if (!error && deletedIssue) {
          res.json('deleted ' + deletedIssue.id);
        } else if (!deletedIssue) {
          res.json('could not delete ' + _id);
        }
      });
    });
};
