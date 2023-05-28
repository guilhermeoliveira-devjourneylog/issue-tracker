const mySecret = process.env['PW']
'use strict';

const expect = require('chai').expect;
let mongodb = require('mongodb')
const mongoose = require('mongoose');

const uri = 'mongodb+srv://Developer:' + process.env.PW + '@freecodecamp.mxzeiwy.mongodb.net/issue_tracker?retryWrites=true&w=majority';

module.exports = function (app) {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  let issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    open: { type: Boolean, required: true, default: true },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
    project: { type: String, default: '' }
  });

  let Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')

  
  .get(function (req, res) {
    const project = req.params.project;
    const filterObject = req.query;
    filterObject.project = project;
    Issue.find(filterObject).exec()
      .then(arrayOfResults => {
        return res.status(200).json(arrayOfResults);
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json({ error: 'Error retrieving the issues' });
      });
  })

  /* .get(function (req, res) {
    let project = req.params.project;
    let filterObject = { project };

    // Adicione os filtros à filterObject, se existirem
    if (req.query.open !== undefined) {
      filterObject.open = req.query.open === 'true';
    }
    if (req.query.created_by) {
      filterObject.created_by = req.query.created_by;
    }
    // Adicione mais condições if para outros filtros, se necessário

    Issue.find(filterObject, (error, arrayOfResults) => {
      if (!error && arrayOfResults) {
        return res.json(arrayOfResults);
      } else {
        return res.json({ error: 'Error retrieving issues' });
      }
    });
  }) */

    .post(function (req, res) {
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: 'Required fields missing from request' });
      }
      let newIssue = new Issue({ ...req.body, project });
      newIssue.save()
        .then(savedIssue => {
          return res.json(savedIssue);
        })
        .catch(error => {
          return res.json({ error: 'Could not save the new issue' });
        });
    })

    .put(function (req, res) {
      let project = req.params.project;
      let updateObject = { ...req.body };
      updateObject.updated_on = new Date().toUTCString();
      if (Object.keys(updateObject).length < 2 || !updateObject._id) {
        return res.json({ error: 'No updated field or _id sent' });
      }
      Issue.findByIdAndUpdate(
        updateObject._id,
        updateObject,
        { new: true }
      )
        .then(updatedIssue => {
          if (updatedIssue) {
            return res.json({ result: 'successfully updated', _id: updatedIssue._id });
          } else {
            return res.json({ error: 'Could not update ' + updateObject._id });
          }
        })
        .catch(error => {
          return res.json({ error: 'Could not update ' + updateObject._id });
        });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'Missing _id' });
      }
      Issue.findByIdAndRemove(req.body._id)
        .then(deletedIssue => {
          if (deletedIssue) {
            return res.json({ result: 'Deleted ' + deletedIssue._id });
          } else {
            return res.json({ error: 'Could not delete ' + req.body._id });
          }
        })
        .catch(error => {
          return res.json({ error: 'Could not delete ' + req.body._id });
        });
    });
};
