import React, { Component } from 'react';
import _ from 'lodash';

class TreeStateWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { generationIndex: 1 };
    }

    componentWillMount() {
        this.cursors = {};
        _.each(this.props.schema, (value, key) => {
            const cursor = this.props.tree.select(key);
            if (typeof cursor.get() === 'undefined') {
                cursor.set(value);
            }
            cursor.on('update', () => 
                this.setState({ generationIndex: this.state.generationIndex + 1 })
            );
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

