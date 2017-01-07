import React from 'react';
import _ from 'lodash';
import schema from '../libs/state';
import { guid } from '../libs/utils';
import Counter from './counter';

const model = {
    tree: {
        counters: [],
    },
};

function CounterList(props) {
    const countersCursor = props.tree.counters;
    return (
        <div>
            {countersCursor.map((cursor) => {
                const value = cursor.get();
                const id = _.isEmpty(value) ? guid() : value.id;
                return (
                    <Counter key={id} tree={cursor} />
                );
            })}
            <button onClick={() => countersCursor.push({})}>+</button>
        </div>
    );
}

export default schema(model)(CounterList);
