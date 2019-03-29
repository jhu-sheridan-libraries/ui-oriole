import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pane, PaneMenu, IconButton, IfPermission, Button, Row, Col, List, TextField, TextArea, Accordion, Headline, Badge } from '@folio/stripes/components';
import { Field, FieldArray } from 'redux-form';
import _ from 'lodash';
import stripesForm from '@folio/stripes/form';

function validate(values, props) {
  const errors = {};
  return errors;
}

class DatabasePane extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    parentMutator: PropTypes.object,
    parentResources: PropTypes.object,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    initialValues: PropTypes.object,
    expanded: PropTypes.bool,
    accordionId: PropTypes.string,
    onToggle: PropTypes.func,
  }

  getLastMenu = (id, label) => {
    const { pristine, submitting, handleSubmit } = this.props;

    return (
      <PaneMenu>
        <Button
          id={id}
          type="submit"
          title={label}
          disabled={pristine || submitting}
          onClick={handleSubmit}
          style={{ marginBottom: '0' }}
        >
          {label}
        </Button>
      </PaneMenu>
    );
  }

  deleteResource = (id) => {
    const { parentMutator } = this.props;
    parentMutator.records.DELETE({ id }).then(() => {
      parentMutator.query.update({
        _path: '/oriole-resources',
        layer: null
      });
    });
  }

  renderTagField = ({ input, label, type, meta: { touched, error } }) => (
    <div>
      <label>{label}</label>
      <div>
        <input {...input} type={type} placeholder={label} />
        {touched && error && <span>{error}</span>}
      </div>
    </div>
  )

  renderTags = ({ fields }) => (
    <ul>
      <li>
        <Button type="button" onClick={() => fields.push()}>
          Add Tag
        </Button>
      </li>
      {fields.map((tag, index) => (
        <li key={index}>
          <Button type="button" title="Remove Tag" onClick={() => fields.remove(index)} >Remove Tag</Button>
          <Field name={tag} type="text" component={this.renderTagField} label={`Tag #${index + 1}`} />
        </li>
      ))}
    </ul>
  )

  render() {
    const { initialValues, expanded, accordionId, onToggle } = this.props;
    const firstMenu = (
      <PaneMenu>
        <IconButton id="clickable-closeneworioledialog" onClick={this.props.onCancel} title="Close" icon="times" />
      </PaneMenu>
    );
    const lastMenu = initialValues.id ?
      this.getLastMenu('clickable-updateuser', 'Update') :
      this.getLastMenu('clickable-createnewuser', 'Create');
    const paneTitle = initialValues.id ? <span>Edit: {_.get(initialValues, ['title'], '')} </span> : 'Create Resource';
    const showDeleteButton = initialValues.id || false;
    const size = initialValues.id ? initialValues.tags.tagList.length : 0;

    return (
      <form id="form-resource">
        <div id="form-add-new-resource">
          <Pane defaultWidth="100%" firstMenu={firstMenu} lastMenu={lastMenu} paneTitle={paneTitle}>
            <Row>
              <Col xs={8}>
                <Field label="Title" name="title" id="title" component={TextField} fullWidth />
                <Field label="URL" name="url" id="url" component={TextField} fullWidth />
                <Field label="Description" name="description" id="description" component={TextArea} fullWidth />
                <Field label="Publisher" name="publisher" id="publisher" component={TextField} fullWidth />
                <Field label="Creator" name="creator" id="creator" component={TextField} fullWidth />
                <Accordion
                  open={expanded}
                  id={accordionId}
                  onToggle={onToggle}
                  label={<Headline size="large" tag="h3">Tags</Headline>}
                  displayWhenClosed={<Badge>{size}</Badge>}
                >
                  <FieldArray name="tags.tagList" id="tags" component={this.renderTags} fullWidth />
                </Accordion>
              </Col>
            </Row>
            {/* <IfPermission perm="oriole.resources.item.delete"> */}
            <Row end="xs">
              <Col xs={12}>
                {
                  showDeleteButton &&
                  <Button type="button" buttonStyle="danger" onClick={() => { this.deleteResource(this.props.initialValues.id); }}>Remove</Button>
                }
              </Col>
            </Row>
            {/* </IfPermission> */}
          </Pane>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'orioleForm',
  validate,
  undefined,
  asyncBlurFields: ['title'],
  navigationCheck: true,
  enableReinitialize: true,
})(DatabasePane);
