import React, { Component } from 'react';
import Baobab from 'baobab';
import _ from 'lodash';

function compareProps(oldProps, newProps) {
    const oldKeys = _.keys(oldProps);
    const newKeys = _.keys(newProps);
    if (oldKeys.length !== newKeys.length) {
        return false;
    }
    for (let index = 0; index < newKeys.length; index += 1) {
        let key = oldKeys[index];
        if (oldProps[key] instanceof Baobab.Cursor) {
            continue;
        }
        if (!_.isEqual(oldProps[key], newProps[key])) {
            return false;
        }
    }
    return true;
}

function initCursor(cursor, schema) {
    if (_.isFunction(schema)) {
        if (!cursor.exists()) {
            schema(cursor);
        }
    } else if (_.isObject(schema) && !_.isArray(schema)) {
        _.each(schema, (childSchema, path) => {
            initCursor(cursor.select(path), childSchema);
        });
    } else if (!cursor.exists()) {
        cursor.set(schema);
    }
}

class TreeStateWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { generationIndex: 1 };
        this.updateGenerationIndex = this.updateGenerationIndex.bind(this);
    }

    componentWillMount() {
        _.each(this.props.parentProps, (prop, propName) => {
            if (prop instanceof Baobab.Cursor) {
                const schema = this.props.schema[propName];
                if (schema) {
                    initCursor(prop, schema);
                    prop.tree.commit();
                }
                prop.on('update', this.updateGenerationIndex);
            }
        });
    }

    componentWillReceiveProps(props) {
        _.each(props.parentProps, (prop, propName) => {
            if (prop instanceof Baobab.Cursor) {
                const oldProp = this.props.parentProps[propName];
                if (oldProp.path !== prop.path) {
                    oldProp.off('update', this.updateGenerationIndex);
                    const schema = this.props.schema[propName];
                    if (schema) {
                        initCursor(prop, schema);
                        prop.tree.commit();
                    }
                    prop.on('update', this.updateGenerationIndex);
                }
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        const isPropsEqual = compareProps(this.props.parentProps, nextProps.parentProps);
        const isStateEqual = _.isEqual(this.state, nextState);
        return !(isPropsEqual && isStateEqual);
    }

    componentWillUnmount() {
        _.each(this.props.parentProps, (cursor) => {
            if (cursor instanceof Baobab.Cursor) {
                cursor.off('update', this.updateGenerationIndex);
            }
        });
    }

    updateGenerationIndex() {
        this.setState({ generationIndex: this.state.generationIndex + 1 });
    }

    render() {
        const ChildComponent = this.props.component;
        return (
            <ChildComponent {...this.props.parentProps} />
        );
    }
}


export default (model) => (component) => (props) => {
    let schema;
    if (_.isFunction(model)) {
        schema = model(props);
    } else {
        schema = model;
    }

    return (
        <TreeStateWrapper
            schema={schema}
            component={component}
            parentProps={props}
        />
    );
};
