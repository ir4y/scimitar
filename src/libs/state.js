import React, { Component } from 'react';
import Baobab from 'baobab';
import _ from 'lodash';

function patchCursor(cursor, keys) {
    const descriptor = (newCursor) => ({
        configurable: true,
        enumerable: false,
        get: () => patchCursor(newCursor),
    });
    const value = cursor.get();
    if (_.isArray(value)) {
        return cursor;
    }
    _.each(keys || _.keys(cursor.get()), (path) =>
        Object.defineProperty(cursor, path, descriptor(cursor.select(path)))
    );
    return cursor;
}

function initCursor(cursor, schema) {
    if (_.isFunction(schema)) {
        if (_.isEmpty(cursor.get())) {
            schema(cursor);
        }
    } else if (_.isObject(schema) && !_.isArray(schema)) {
        _.each(schema, (childSchema, path) => {
            initCursor(cursor.select(path), childSchema);
        });
    } else if (_.isEmpty(cursor.get())) {
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
                const schema =  this.props.schema[propName];
                if (schema) {
                    initCursor(prop, schema);
                }
                prop.tree.commit();
                prop.on('update', this.updateGenerationIndex);
                patchCursor(prop);
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        const isPropsEqual = _.isEqual(this.props.parentProps, nextProps.parentProps);
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
        const Component = this.props.component;
        return (
            <Component {...this.props.parentProps} />
        );
    }
}


export default (model) => (component) => (props) => {
    return (
        <TreeStateWrapper
            schema={model}
            component={component}
            parentProps={props}
        />
    );
}
