import React, { Component } from 'react';
import _ from 'lodash';

class TreeStateWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { generationIndex: 1 };
        this.updateGenerationIndex = this.updateGenerationIndex.bind(this);
    }

    componentWillMount() {
        this.cursors = {};
        _.each(this.props.schema, (value, key) => {
            const cursor = this.props.tree.select(key);
            if (_.isEmpty(cursor.get())) {
                if (_.isFunction(value)) {
                    value(cursor);
                } else {
                    cursor.set(value);
                }
                cursor.tree.commit();
            }
            cursor.on('update', this.updateGenerationIndex);
            const descriptor = {
                configurable: false,
                enumerable: false,
                get: () => cursor.get(),
                set: (v) => cursor.set(v),
            };
            Object.defineProperty(this.cursors, key, descriptor);
            this.cursors[`${key}Cursor`] = cursor;
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        const isPropsEqual = _.isEqual(this.props.parentProps, nextProps.parentProps);
        const isStateEqual = _.isEqual(this.state, nextState);
        return !(isPropsEqual && isStateEqual);
    }

    componentWillUnmount() {
        _.each(this.cursors, (cursor) => cursor.off('update', this.updateGenerationIndex));
    }

    updateGenerationIndex() {
        this.setState({ generationIndex: this.state.generationIndex + 1 });
    }

    render() {
        const Component = this.props.component;
        return (
            <Component cursors={this.cursors} {...this.props.parentProps} />
        );
    }
}


export default function schema(model) {
    return (component) => {
        return (props) => {
            const tree =  props.tree;
            const parentProps = { ...props };
            parentProps.tree= undefined;
            return (
                <TreeStateWrapper
                    tree={tree}
                    schema={model}
                    component={component}
                    parentProps={parentProps}
                />
            );
        };
    };
}


