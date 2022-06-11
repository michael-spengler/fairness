
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (72:2) {#if visitorLevel == 1}
    function create_if_block_1(ctx) {
    	let br0;
    	let t0;
    	let p0;
    	let br1;
    	let t1;
    	let input0;
    	let t2;
    	let p1;
    	let br2;
    	let t3;
    	let input1;
    	let t4;
    	let p2;
    	let br3;
    	let t5;
    	let p3;
    	let br4;
    	let t6;
    	let t7;
    	let t8;
    	let p4;
    	let br5;
    	let t9;
    	let if_block2_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*walletAddress*/ ctx[1] != "" && create_if_block_4(ctx);
    	let if_block1 = /*socialMediaProfileLink*/ ctx[2] != "" && create_if_block_3(ctx);
    	let if_block2 = /*walletAddress*/ ctx[1] != "" && /*socialMediaProfileLink*/ ctx[2] != "" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = text("\n\t\t\tFeel free to ...\n\t\t\t");
    			p0 = element("p");
    			br1 = element("br");
    			t1 = text("\n\n\t\t\t... enter your wallet address in which you want to receive CULT\n\t\t\t");
    			input0 = element("input");
    			t2 = space();
    			p1 = element("p");
    			br2 = element("br");
    			t3 = text("\n\t\t\t... enter the link to your social media profile (e.g. your facebook profile).\n\t\t\t");
    			input1 = element("input");
    			t4 = space();
    			p2 = element("p");
    			br3 = element("br");
    			t5 = text("\n\t\t\t... post the following statement on your social media profile \"I like\n\t\t\tthe https://cultdao.io and I am ready to receive a welcome present from\n\t\t\thttps://peer-2-peer.eth.link\"\n\n\t\t\t");
    			p3 = element("p");
    			br4 = element("br");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			p4 = element("p");
    			br5 = element("br");
    			t9 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(br0, file, 72, 3, 1994);
    			add_location(br1, file, 74, 6, 2027);
    			add_location(p0, file, 74, 3, 2024);
    			add_location(input0, file, 77, 3, 2109);
    			add_location(br2, file, 79, 6, 2153);
    			add_location(p1, file, 79, 3, 2150);
    			add_location(input1, file, 81, 3, 2248);
    			add_location(br3, file, 83, 6, 2301);
    			add_location(p2, file, 83, 3, 2298);
    			add_location(br4, file, 88, 6, 2500);
    			add_location(p3, file, 88, 3, 2497);
    			add_location(br5, file, 104, 6, 2863);
    			add_location(p4, file, 104, 3, 2860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, br1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*walletAddress*/ ctx[1]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, br2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*socialMediaProfileLink*/ ctx[2]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, br3);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, br4);
    			insert_dev(target, t6, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, br5);
    			insert_dev(target, t9, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*walletAddress*/ 2 && input0.value !== /*walletAddress*/ ctx[1]) {
    				set_input_value(input0, /*walletAddress*/ ctx[1]);
    			}

    			if (dirty & /*socialMediaProfileLink*/ 4 && input1.value !== /*socialMediaProfileLink*/ ctx[2]) {
    				set_input_value(input1, /*socialMediaProfileLink*/ ctx[2]);
    			}

    			if (/*walletAddress*/ ctx[1] != "") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t7.parentNode, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*socialMediaProfileLink*/ ctx[2] != "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(t8.parentNode, t8);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*walletAddress*/ ctx[1] != "" && /*socialMediaProfileLink*/ ctx[2] != "") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t6);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t9);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:2) {#if visitorLevel == 1}",
    		ctx
    	});

    	return block;
    }

    // (91:3) {#if walletAddress != ""}
    function create_if_block_4(ctx) {
    	let t0;
    	let a;
    	let t1;
    	let a_href_value;
    	let t2;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("Your Wallet Address:\n\t\t\t\t");
    			a = element("a");
    			t1 = text(/*walletAddress*/ ctx[1]);
    			t2 = space();
    			br = element("br");
    			attr_dev(a, "href", a_href_value = "https://etherscan.io/address/" + /*walletAddress*/ ctx[1]);
    			add_location(a, file, 92, 4, 2570);
    			add_location(br, file, 94, 9, 2656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*walletAddress*/ 2) set_data_dev(t1, /*walletAddress*/ ctx[1]);

    			if (dirty & /*walletAddress*/ 2 && a_href_value !== (a_href_value = "https://etherscan.io/address/" + /*walletAddress*/ ctx[1])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(91:3) {#if walletAddress != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (98:3) {#if socialMediaProfileLink != ""}
    function create_if_block_3(ctx) {
    	let t0;
    	let a;
    	let t1;
    	let t2;
    	let br;

    	const block = {
    		c: function create() {
    			t0 = text("Your Social Media Profile Link: ");
    			a = element("a");
    			t1 = text(/*socialMediaProfileLink*/ ctx[2]);
    			t2 = space();
    			br = element("br");
    			attr_dev(a, "href", /*socialMediaProfileLink*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 98, 36, 2747);
    			add_location(br, file, 101, 6, 2840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*socialMediaProfileLink*/ 4) set_data_dev(t1, /*socialMediaProfileLink*/ ctx[2]);

    			if (dirty & /*socialMediaProfileLink*/ 4) {
    				attr_dev(a, "href", /*socialMediaProfileLink*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(98:3) {#if socialMediaProfileLink != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (106:3) {#if walletAddress != "" && socialMediaProfileLink != ""}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "That's Correct! I'm ready to receive cult!";
    			add_location(button, file, 106, 4, 2939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(106:3) {#if walletAddress != \\\"\\\" && socialMediaProfileLink != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {#if visitorLevel === 2}
    function create_if_block(ctx) {
    	let t0;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let p2;
    	let br;
    	let t3;
    	let table;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let each_value = /*newcomers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text("Below you find a list of newcomers. As soon as they posted\n\t\t\t");
    			p0 = element("p");
    			t1 = text("\n\t\t\t\"I like the https://cultdao.io and I am ready to receive a welcome present\n\t\t\tfrom https://peer-2-peer.eth.link\"\n\t\t\t");
    			p1 = element("p");
    			t2 = text("\n\t\t\ton their profile, you might send some of them some Cult, so that they\n\t\t\tcollect some experiences and so that we further improve the distributedness\n\t\t\tof our cult :)\n\t\t\t");
    			p2 = element("p");
    			br = element("br");
    			t3 = space();
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Wallet Address";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Social Media Profile Link";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p0, file, 115, 3, 3167);
    			add_location(p1, file, 118, 3, 3292);
    			add_location(br, file, 122, 6, 3474);
    			add_location(p2, file, 122, 3, 3471);
    			attr_dev(th0, "class", "svelte-1k3ry7y");
    			add_location(th0, file, 126, 5, 3511);
    			attr_dev(th1, "class", "svelte-1k3ry7y");
    			add_location(th1, file, 127, 5, 3540);
    			add_location(tr, file, 125, 4, 3501);
    			attr_dev(table, "class", "svelte-1k3ry7y");
    			add_location(table, file, 124, 3, 3489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, br);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(table, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newcomers*/ 1) {
    				each_value = /*newcomers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(114:2) {#if visitorLevel === 2}",
    		ctx
    	});

    	return block;
    }

    // (130:4) {#each newcomers as newcomer}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let t0_value = /*newcomer*/ ctx[12].walletAddress + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let td1;
    	let a1;
    	let t2_value = /*newcomer*/ ctx[12].socialMediaProfileLink + "";
    	let t2;
    	let a1_href_value;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a1 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(a0, "href", a0_href_value = "https://etherscan.io/address/" + /*newcomer*/ ctx[12].walletAddress);
    			add_location(a0, file, 132, 7, 3647);
    			attr_dev(td0, "class", "svelte-1k3ry7y");
    			add_location(td0, file, 131, 6, 3635);
    			attr_dev(a1, "href", a1_href_value = /*newcomer*/ ctx[12].socialMediaProfileLink);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file, 139, 8, 3803);
    			attr_dev(td1, "class", "svelte-1k3ry7y");
    			add_location(td1, file, 138, 6, 3791);
    			add_location(tr, file, 130, 5, 3624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			append_dev(a1, t2);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newcomers*/ 1 && t0_value !== (t0_value = /*newcomer*/ ctx[12].walletAddress + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*newcomers*/ 1 && a0_href_value !== (a0_href_value = "https://etherscan.io/address/" + /*newcomer*/ ctx[12].walletAddress)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*newcomers*/ 1 && t2_value !== (t2_value = /*newcomer*/ ctx[12].socialMediaProfileLink + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*newcomers*/ 1 && a1_href_value !== (a1_href_value = /*newcomer*/ ctx[12].socialMediaProfileLink)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(130:4) {#each newcomers as newcomer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let video;
    	let source;
    	let source_src_value;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let h2;
    	let t4;
    	let p0;
    	let t6;
    	let p1;
    	let t8;
    	let p2;
    	let t9;
    	let a;
    	let t11;
    	let t12;
    	let p3;
    	let br0;
    	let t13;
    	let button0;
    	let t15;
    	let button1;
    	let t17;
    	let br1;
    	let t18;
    	let t19;
    	let p4;
    	let br2;
    	let t20;
    	let mounted;
    	let dispose;
    	let if_block0 = /*visitorLevel*/ ctx[3] == 1 && create_if_block_1(ctx);
    	let if_block1 = /*visitorLevel*/ ctx[3] === 2 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			video = element("video");
    			source = element("source");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "CultDAO Ecosystem";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Welcome Present";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Some of us are pretty lucky as we could explore the distributed\n\t\t\tledger space from early on.";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "So some of us have strong wallets containing many valuable Cult\n\t\t\tTokens.";
    			t8 = space();
    			p2 = element("p");
    			t9 = text("Some of us want to give newcomers the chance to get familiar with\n\t\t\t");
    			a = element("a");
    			a.textContent = "metamask.io";
    			t11 = text(" and are\n\t\t\tready to donate some Cult to those newcomers.");
    			t12 = space();
    			p3 = element("p");
    			br0 = element("br");
    			t13 = space();
    			button0 = element("button");
    			button0.textContent = "I'm a newcomer";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "I'm an insider";
    			t17 = space();
    			br1 = element("br");
    			t18 = space();
    			if (if_block0) if_block0.c();
    			t19 = space();
    			p4 = element("p");
    			br2 = element("br");
    			t20 = space();
    			if (if_block1) if_block1.c();
    			if (!src_url_equal(source.src, source_src_value = "https://cultdao.io/wp-content/uploads/2022/01/Stormy-Sky2.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file, 42, 2, 1203);
    			video.autoplay = true;
    			video.muted = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-1k3ry7y");
    			add_location(video, file, 41, 1, 1173);
    			attr_dev(h1, "class", "svelte-1k3ry7y");
    			add_location(h1, file, 49, 2, 1340);
    			attr_dev(h2, "class", "svelte-1k3ry7y");
    			add_location(h2, file, 50, 2, 1369);
    			add_location(p0, file, 51, 2, 1396);
    			add_location(p1, file, 55, 2, 1507);
    			attr_dev(a, "href", "https://metamask.io");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 61, 3, 1674);
    			add_location(p2, file, 59, 2, 1598);
    			add_location(br0, file, 65, 5, 1806);
    			add_location(p3, file, 65, 2, 1803);
    			add_location(button0, file, 67, 2, 1820);
    			add_location(button1, file, 68, 2, 1889);
    			add_location(br1, file, 69, 2, 1957);
    			add_location(br2, file, 112, 5, 3064);
    			add_location(p4, file, 112, 2, 3061);
    			attr_dev(div, "id", "overlay");
    			attr_dev(div, "class", "svelte-1k3ry7y");
    			add_location(div, file, 48, 1, 1319);
    			attr_dev(main, "class", "svelte-1k3ry7y");
    			add_location(main, file, 40, 0, 1165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, video);
    			append_dev(video, source);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, h2);
    			append_dev(div, t4);
    			append_dev(div, p0);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(div, t8);
    			append_dev(div, p2);
    			append_dev(p2, t9);
    			append_dev(p2, a);
    			append_dev(p2, t11);
    			append_dev(div, t12);
    			append_dev(div, p3);
    			append_dev(p3, br0);
    			append_dev(div, t13);
    			append_dev(div, button0);
    			append_dev(div, t15);
    			append_dev(div, button1);
    			append_dev(div, t17);
    			append_dev(div, br1);
    			append_dev(div, t18);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t19);
    			append_dev(div, p4);
    			append_dev(p4, br2);
    			append_dev(div, t20);
    			if (if_block1) if_block1.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visitorLevel*/ ctx[3] == 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t19);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*visitorLevel*/ ctx[3] === 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const backendBaseURL = "http://localhost:3001";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let newcomers = [];
    	let walletAddress = "";
    	let socialMediaProfileLink = "";
    	let visitorLevel = 0;

    	async function confirmData() {
    		try {
    			const response = await fetch(`${backendBaseURL}/api/v1/addNewcomer`, {
    				method: "post",
    				headers: {
    					Accept: "application/json",
    					"Content-Type": "application/json"
    				},
    				body: JSON.stringify({ walletAddress, socialMediaProfileLink })
    			});

    			const serverInfo = await response.json();

    			if (serverInfo.status !== "mission accomplished") {
    				alert(serverInfo.status);
    			}
    		} catch(error) {
    			alert(`${error.message}. Please raise an issue on https://github.com/michael-spengler/fairness`);
    		}
    	}

    	function clickNewcomer() {
    		$$invalidate(3, visitorLevel = 1);
    	}

    	function clickInsider() {
    		$$invalidate(3, visitorLevel = 2);
    	}

    	onMount(async () => {
    		const response = await fetch(`${backendBaseURL}/api/v1/getNewcomers`);
    		$$invalidate(0, newcomers = await response.json());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => clickNewcomer();
    	const click_handler_1 = () => clickInsider();

    	function input0_input_handler() {
    		walletAddress = this.value;
    		$$invalidate(1, walletAddress);
    	}

    	function input1_input_handler() {
    		socialMediaProfileLink = this.value;
    		$$invalidate(2, socialMediaProfileLink);
    	}

    	const click_handler_2 = () => confirmData();

    	$$self.$capture_state = () => ({
    		onMount,
    		backendBaseURL,
    		newcomers,
    		walletAddress,
    		socialMediaProfileLink,
    		visitorLevel,
    		confirmData,
    		clickNewcomer,
    		clickInsider
    	});

    	$$self.$inject_state = $$props => {
    		if ('newcomers' in $$props) $$invalidate(0, newcomers = $$props.newcomers);
    		if ('walletAddress' in $$props) $$invalidate(1, walletAddress = $$props.walletAddress);
    		if ('socialMediaProfileLink' in $$props) $$invalidate(2, socialMediaProfileLink = $$props.socialMediaProfileLink);
    		if ('visitorLevel' in $$props) $$invalidate(3, visitorLevel = $$props.visitorLevel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		newcomers,
    		walletAddress,
    		socialMediaProfileLink,
    		visitorLevel,
    		confirmData,
    		clickNewcomer,
    		clickInsider,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
