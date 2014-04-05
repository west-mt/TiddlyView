/**
 * Markdown.dialects.Tiddly
 *
 **/
Add_Tiddly = function(Markdown){


Markdown.dialects.Tiddly = {
  block: {
    atxHeader: function atxHeader( block, next ) {
      var m = block.match( /^(!{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

      if ( !m ) return undefined;

      var header = [ "header", { level: m[ 1 ].length } ];
      Array.prototype.push.apply(header, this.processInline(m[ 2 ]));

      if ( m[0].length < block.length )
        next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

      return [ header ];
    },

    code: function code( block, next ) {
      // |    Foo
      // |bar
      // should be a code block followed by a paragraph. Fun
      //
      // There might also be adjacent code block to merge.

      var ret = [],
          //re = /^(?: {0,3}\t| {4})(.*)\n?/,
          re = /^(?: {0,3}\t| {4})(.*)\n?/,
          lines;

      // 4 spaces + content
      if ( !block.match( re ) ) return undefined;

      block_search:
      do {
        // Now pull out the rest of the lines
        var b = this.loop_re_over_block(
                  re, block.valueOf(), function( m ) { ret.push( m[1] ); } );

        if ( b.length ) {
          // Case alluded to in first comment. push it back on as a new block
          next.unshift( mk_block(b, block.trailing) );
          break block_search;
        }
        else if ( next.length ) {
          // Check the next block - it might be code too
          if ( !next[0].match( re ) ) break block_search;

          // Pull how how many blanks lines follow - minus two to account for .join
          ret.push ( block.trailing.replace(/[^\n]/g, "").substring(2) );

          block = next.shift();
        }
        else {
          break block_search;
        }
      } while ( true );

      return [ [ "code_block", ret.join("\n") ] ];
    },

	code2: function code2(block, next) {
	  var ret = [],
	  //startRe = /^```(.*)\n?((.|\n)*)/,
	  startRe = /^```((.|\n)*)/,
	  endRe = /(.|\n)*```\n?$/,
	  m = block.match(startRe),
	  code, lineRe, isEnd;
	  if(!block.match(startRe)) return undefined;

	  code = m[1];
	  block_search:
		do {
		  if(isEnd = endRe.test(code)) code = code.substring(0, code.length - 3);
		  lineRe = new RegExp('^(?:' + (code.match(/(\s*)/)[1] || '') + ')(.*)\\n?');
		  var b = this.loop_re_over_block(lineRe, code, function(m) {ret.push(m[1]);});
		  if(b.length) ret.push(b);

		  if(next.length && !isEnd) {
			ret.push ( block.trailing.replace(/[^\n]/g, '').substring(2) );
			block = next.shift();
			code = block.valueOf();
		  } else {
			break block_search;
		  }
		} while(!isEnd);
	  return [['code_block', ret.join('\n')]];
	},

    horizRule: function horizRule( block, next ) {
      // this needs to find any hr in the block to handle abutting blocks
      //var m = block.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );
      var m = block.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_=])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

      if ( !m ) {
        return undefined;
      }

      var jsonml = [ [ "hr" ] ];

      // if there's a leading abutting block, process it
      if ( m[ 1 ] ) {
        jsonml.unshift.apply( jsonml, this.processBlock( m[ 1 ], [] ) );
      }

      // if there's a trailing abutting block, stick it into next
      if ( m[ 3 ] ) {
        next.unshift( mk_block( m[ 3 ] ) );
      }

      return jsonml;
    },

    // There are two types of lists. Tight and loose. Tight lists have no whitespace
    // between the items (and result in text just in the <li>) and loose lists,
    // which have an empty line between list items, resulting in (one or more)
    // paragraphs inside the <li>.
    //
    // There are all sorts weird edge cases about the original markdown.pl's
    // handling of lists:
    //
    // * Nested lists are supposed to be indented by four chars per level. But
    //   if they aren't, you can get a nested list by indenting by less than
    //   four so long as the indent doesn't match an indent of an existing list
    //   item in the 'nest stack'.
    //
    // * The type of the list (bullet or number) is controlled just by the
    //    first item at the indent. Subsequent changes are ignored unless they
    //    are for nested lists
    //
    lists:
	(function( ) {
       // Use a closure to hide a few variables.
	   var any_list = "[*+#-]";
	   var bullet_list = /[*+-]/;
       var number_list = /#/;
	   var list_patt = new RegExp("(?:^(" + any_list + "{1,4})\\s+)|"
								 + "(^\\s?)");
	   var is_list_re = new RegExp("(?:^(" + any_list + "{1,4})\\s+)");

       function add_listitem(list, inline){
		 var list_item = ["listitem"];
		 for(var i = 0; i < inline.length; i++){
		   list_item.push(inline[i]);
		 }
		 list.push(list_item);
	   }


       // The matcher function
       return function( block, next ) {
         var m = block.match( is_list_re );
         if ( !m ) return undefined;

         function make_list( m ) {
           var list = bullet_list.exec( m[2] )
             ? ["bulletlist"]
             : ["numberlist"];

           stack.push( { list: list, indent: m[1] } );
           return list;
         }


         var stack = [], // Stack of lists for nesting.
         list = make_list( m ),
         last_li,
         loose = false,
         ret = [ stack[0].list ],
         i;

		 var last_depth = 0;
		 var result = [];
		 var nest_stack = [];
		 var current_list = result;

         // Loop to search over block looking for inner block elements and loose lists
         // Split into lines preserving new lines at end of line
         var lines = block.split( /(?=\n)/ );

         for ( var line_no = 0; line_no < lines.length; line_no++ ) {
           //var nl = "",
           //    l = lines[line_no].replace(/^\n/, function(n) { nl = n; return ""; });
           var l = lines[line_no].replace(/^\n/, '');


           //m = l.match( line_re );
           m = l.match( list_patt );
		   //alert(l + ', ' + m);

		   if(m){
			 var bullet = bullet_list.exec(m[1]);
			 var depth = 0;
			 var str = l.substr( m[0].length );

			 if(m[1] !== undefined){
			   depth = m[1].length;
			 }

			 if(depth > last_depth){

			   //もし深さが2つ以上増えていたら、分類不明のリストを追加
			   for(i = last_depth+1; i < depth; i++){
				 var new_list = [null];
				 //現在のリストの子要素に追加
				 current_list.push(new_list);
				 //ネストのスタックの末尾にも追加
				 nest_stack.push(new_list);

				 current_list = new_list;
			   }

			   var new_list;
			   if(bullet){
				 new_list = ["bulletlist"];
			   }else{
				 new_list = ["numberlist"];
			   }
			   //現在のリストの子要素に追加
			   current_list.push(new_list);
			   //ネストのスタックの末尾にも追加
			   nest_stack.push(new_list);

			   current_list = new_list;

			   add_listitem(current_list,
							this.processInline(l.substr(m[0].length)));

			   last_depth = depth;
			 }else if(depth == last_depth){

			   //同じレベルでもリストのタイプ(順序あり/なし)が異なる場合、一度リストを閉じる。
			   var list_type = bullet ? "bulletlist":"numberlist";

			   if(current_list[0] != list_type){
				 //現在のリストを閉じる。
				 nest_stack.pop();

				 var new_list;
				 if(bullet){
				   new_list = ["bulletlist"];
				 }else{
				   new_list = ["numberlist"];
				 }

				 //ネストのスタックの末尾に新しいリストを追加
				 nest_stack.push(new_list);
				 current_list = new_list;
			   }


			   add_listitem(current_list,
							this.processInline(str));


			   last_depth = depth;
			 }else if(depth <= 0){
			   var inline = this.processInline(str);
			   var last_listitem = current_list[current_list.length-1];

			   if(depth < 0) last_listitem.push(['br']);
			   for(i = 0; i < inline.length; i++){
				 last_listitem.push(inline[i]);
			   }

			 }else	if(depth < last_depth){

			   //print(depth, last_depth, nest_stack.length);
			   //一度に深さが2以上変化している場合、分類未定のリストは順序なし箇条書きとして閉じる。
			   for(i=last_depth; i>depth+1; i--){
				 var close_list = nest_stack.pop();
				 if(close_list[0] == null){
				   close_list[0] = ["bulletlist"];
				 }
			   }
			   nest_stack.pop();
			   current_list = nest_stack[nest_stack.length-1];

			   //print(JSON.stringify(result));
			   //print(depth, last_depth, nest_stack.length);
			   //リストのタイプが未確定な場合、タイプを確定
			   if(current_list[0] == null){
				 if(bullet){
				   current_list[0] = ["bulletlist"];
				 }else{
				   current_list[0] = ["numberlist"];
				 }
			   }

			   //同じレベルでもリストのタイプ(順序あり/なし)が異なる場合、一度リストを閉じる。
			   var list_type = bullet ? "bulletlist":"numberlist";

			   if(current_list[0] != list_type){
				 //現在のリストを閉じる。
				 nest_stack.pop();

				 var new_list;
				 if(bullet){
				   new_list = ["bulletlist"];
				 }else{
				   new_list = ["numberlist"];
				 }

				 //ネストのスタックの末尾に新しいリストを追加
				 nest_stack.push(new_list);
				 current_list = new_list;
			   }


			   add_listitem(current_list,
							this.processInline(str));

			   last_depth = depth;
			 }


			 if(bullet)
			   print(depth, str);
			 else
			   print('('+depth+')', str);
		   }

		   for(i=0; i<nest_stack.length; i++){
			 if(nest_stack[i][0] == null){
			   nest_stack[i][0] = 'bulletlist';
			 }
		   }

         } // tight_search

		 print('--------');

         return result;
         //return ret;
       };
     })(),

    blockquote: function blockquote( block, next ) {
      if ( !block.match( /^>/m ) )
        return undefined;

      var jsonml = [];

      // separate out the leading abutting block, if any. I.e. in this case:
      //
      //  a
      //  > b
      //
      if ( block[ 0 ] != ">" ) {
        var lines = block.split( /\n/ ),
            prev = [],
            line_no = block.lineNumber;

        // keep shifting lines until you find a crotchet
        while ( lines.length && lines[ 0 ][ 0 ] != ">" ) {
            prev.push( lines.shift() );
            line_no++;
        }

        var abutting = mk_block( prev.join( "\n" ), "\n", block.lineNumber );
        jsonml.push.apply( jsonml, this.processBlock( abutting, [] ) );
        // reassemble new block of just block quotes!
        block = mk_block( lines.join( "\n" ), block.trailing, line_no );
      }


      // if the next block is also a blockquote merge it in
      while ( next.length && next[ 0 ][ 0 ] == ">" ) {
        var b = next.shift();
        block = mk_block( block + block.trailing + b, b.trailing, block.lineNumber );
      }

      // Strip off the leading "> " and re-process as a block.
      var input = block.replace( /^> ?/gm, "" ),
          old_tree = this.tree,
          processedBlock = this.toTree( input, [ "blockquote" ] ),
          attr = extract_attr( processedBlock );

      // If any link references were found get rid of them
      if ( attr && attr.references ) {
        delete attr.references;
        // And then remove the attribute object if it's empty
        if ( isEmpty( attr ) ) {
          processedBlock.splice( 1, 1 );
        }
      }

      jsonml.push( processedBlock );
      return jsonml;
    },

    referenceDefn: function referenceDefn( block, next) {
      var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;
      // interesting matches are [ , ref_id, url, , title, title ]

      if ( !block.match(re) )
        return undefined;

      // make an attribute node if it doesn't exist
      if ( !extract_attr( this.tree ) ) {
        this.tree.splice( 1, 0, {} );
      }

      var attrs = extract_attr( this.tree );

      // make a references hash if it doesn't exist
      if ( attrs.references === undefined ) {
        attrs.references = {};
      }

      var b = this.loop_re_over_block(re, block, function( m ) {

        if ( m[2] && m[2][0] == "<" && m[2][m[2].length-1] == ">" )
          m[2] = m[2].substring( 1, m[2].length - 1 );

        var ref = attrs.references[ m[1].toLowerCase() ] = {
          href: m[2]
        };

        if ( m[4] !== undefined )
          ref.title = m[4];
        else if ( m[5] !== undefined )
          ref.title = m[5];

      } );

      if ( b.length )
        next.unshift( mk_block( b, block.trailing ) );

      return [];
    },

    para: function para( block, next ) {
      // everything's a para!
      return [ ["para"].concat( this.processInline( block ) ) ];
    }
  }
};

Markdown.dialects.Tiddly.inline = {

    __oneElement__: function oneElement( text, patterns_or_re, previous_nodes ) {
      var m,
          res,
          lastIndex = 0;

      patterns_or_re = patterns_or_re || this.dialect.inline.__patterns__;
      var re = new RegExp( "([\\s\\S]*?)(" + (patterns_or_re.source || patterns_or_re) + ")" );

      m = re.exec( text );
      if (!m) {
        // Just boring text
        return [ text.length, text ];
      }
      else if ( m[1] ) {
        // Some un-interesting text matched. Return that first
        return [ m[1].length, m[1] ];
      }

      var res;
      if ( m[2] in this.dialect.inline ) {
        res = this.dialect.inline[ m[2] ].call(
                  this,
                  text.substr( m.index ), m, previous_nodes || [] );
      }
      // Default for now to make dev easier. just slurp special and output it.
      res = res || [ m[2].length, m[2] ];
      return res;
    },

    __call__: function inline( text, patterns ) {

      var out = [],
          res;

      function add(x) {
        //D:self.debug("  adding output", uneval(x));
        if ( typeof x == "string" && typeof out[out.length-1] == "string" )
          out[ out.length-1 ] += x;
        else
          out.push(x);
      }

      while ( text.length > 0 ) {
        res = this.dialect.inline.__oneElement__.call(this, text, patterns, out );
        text = text.substr( res.shift() );
        forEach(res, add )
      }

      return out;
    },

    // These characters are intersting elsewhere, so have rules for them so that
    // chunks of plain text blocks don't include them
    "]": function () {},
    "}": function () {},

    __escape__ : /^\\[\\`\*_{}\[\]()#\+.!\-]/,

    "\\": function escaped( text ) {
      // [ length of input processed, node/children to add... ]
      // Only esacape: \ ` * _ { } [ ] ( ) # * + - . !
      if ( this.dialect.inline.__escape__.exec( text ) )
        return [ 2, text.charAt( 1 ) ];
      else
        // Not an esacpe
        return [ 1, "\\" ];
    },

    "![": function image( text ) {

      // Unlike images, alt text is plain text only. no other elements are
      // allowed in there

      // ![Alt text](/path/to/img.jpg "Optional title")
      //      1          2            3       4         <--- captures
      var m = text.match( /^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/ );

      if ( m ) {
        if ( m[2] && m[2][0] == "<" && m[2][m[2].length-1] == ">" )
          m[2] = m[2].substring( 1, m[2].length - 1 );

        m[2] = this.dialect.inline.__call__.call( this, m[2], /\\/ )[0];

        var attrs = { alt: m[1], href: m[2] || "" };
        if ( m[4] !== undefined)
          attrs.title = m[4];

        return [ m[0].length, [ "img", attrs ] ];
      }

      // ![Alt text][id]
      m = text.match( /^!\[(.*?)\][ \t]*\[(.*?)\]/ );

      if ( m ) {
        // We can't check if the reference is known here as it likely wont be
        // found till after. Check it in md tree->hmtl tree conversion
        return [ m[0].length, [ "img_ref", { alt: m[1], ref: m[2].toLowerCase(), original: m[0] } ] ];
      }

      // Just consume the '!['
      return [ 2, "![" ];
    },

    "[": function link( text ) {

      var orig = String(text);
      // Inline content is possible inside `link text`
      var res = Markdown.DialectHelpers.inline_until_char.call( this, text.substr(1), "]" );

      // No closing ']' found. Just consume the [
      if ( !res ) return [ 1, "[" ];

      var consumed = 1 + res[ 0 ],
          children = res[ 1 ],
          link,
          attrs;

      // At this point the first [...] has been parsed. See what follows to find
      // out which kind of link we are (reference or direct url)
      text = text.substr( consumed );

      // [link text](/path/to/img.jpg "Optional title")
      //                 1            2       3         <--- captures
      // This will capture up to the last paren in the block. We then pull
      // back based on if there a matching ones in the url
      //    ([here](/url/(test))
      // The parens have to be balanced
      var m = text.match( /^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/ );
      if ( m ) {
        var url = m[1];
        consumed += m[0].length;

        if ( url && url[0] == "<" && url[url.length-1] == ">" )
          url = url.substring( 1, url.length - 1 );

        // If there is a title we don't have to worry about parens in the url
        if ( !m[3] ) {
          var open_parens = 1; // One open that isn't in the capture
          for ( var len = 0; len < url.length; len++ ) {
            switch ( url[len] ) {
            case "(":
              open_parens++;
              break;
            case ")":
              if ( --open_parens == 0) {
                consumed -= url.length - len;
                url = url.substring(0, len);
              }
              break;
            }
          }
        }

        // Process escapes only
        url = this.dialect.inline.__call__.call( this, url, /\\/ )[0];

        attrs = { href: url || "" };
        if ( m[3] !== undefined)
          attrs.title = m[3];

        link = [ "link", attrs ].concat( children );
        return [ consumed, link ];
      }

      // [Alt text][id]
      // [Alt text] [id]
      m = text.match( /^\s*\[(.*?)\]/ );

      if ( m ) {

        consumed += m[ 0 ].length;

        // [links][] uses links as its reference
        attrs = { ref: ( m[ 1 ] || String(children) ).toLowerCase(),  original: orig.substr( 0, consumed ) };

        link = [ "link_ref", attrs ].concat( children );

        // We can't check if the reference is known here as it likely wont be
        // found till after. Check it in md tree->hmtl tree conversion.
        // Store the original so that conversion can revert if the ref isn't found.
        return [ consumed, link ];
      }

      // [id]
      // Only if id is plain (no formatting.)
      if ( children.length == 1 && typeof children[0] == "string" ) {

        attrs = { ref: children[0].toLowerCase(),  original: orig.substr( 0, consumed ) };
        link = [ "link_ref", attrs, children[0] ];
        return [ consumed, link ];
      }

      // Just consume the "["
      return [ 1, "[" ];
    },


    "<": function autoLink( text ) {
      var m;

      if ( ( m = text.match( /^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/ ) ) != null ) {
        if ( m[3] ) {
          return [ m[0].length, [ "link", { href: "mailto:" + m[3] }, m[3] ] ];

        }
        else if ( m[2] == "mailto" ) {
          return [ m[0].length, [ "link", { href: m[1] }, m[1].substr("mailto:".length ) ] ];
        }
        else
          return [ m[0].length, [ "link", { href: m[1] }, m[1] ] ];
      }

      return [ 1, "<" ];
    },

    "`": function inlineCode( text ) {
      // Inline code block. as many backticks as you like to start it
      // Always skip over the opening ticks.
      var m = text.match( /(`+)(([\s\S]*?)\1)/ );

      if ( m && m[2] )
        return [ m[1].length + m[2].length, [ "inlinecode", m[3] ] ];
      else {
        // TODO: No matching end code found - warn!
        return [ 1, "`" ];
      }
    },

    "  \n": function lineBreak( text ) {
      return [ 3, [ "linebreak" ] ];
    }

};

var mk_block = Markdown.mk_block;
var forEach;
// Don't mess with Array.prototype. Its not friendly
if ( Array.prototype.forEach ) {
  forEach = function( arr, cb, thisp ) {
    return arr.forEach( cb, thisp );
  };
}
else {
  forEach = function(arr, cb, thisp) {
    for (var i = 0; i < arr.length; i++) {
      cb.call(thisp || arr, arr[i], i, arr);
    }
  }
}

var isArray = Array.isArray || function(obj) {
  return Object.prototype.toString.call(obj) == "[object Array]";
};

function extract_attr( jsonml ) {
  return isArray(jsonml)
      && jsonml.length > 1
      && typeof jsonml[ 1 ] === "object"
      && !( isArray(jsonml[ 1 ]) )
      ? jsonml[ 1 ]
      : undefined;
}

// Meta Helper/generator method for em and strong handling
function strong_em( tag, md ) {

  var state_name = tag;

  function CloseTag(len) {
    this.len_after = len;
    this.name = "close_" + md;
  }

  return function ( text, orig_match ) {
	var s = tag_states[state_name];

    if ( s[0] == md ) {
      // Most recent em is of this type
      //D:this.debug("closing", md);
      s.shift();

      // "Consume" everything to go back to the recrusion in the else-block below
      return[ text.length, new CloseTag(text.length-md.length) ];
    }
    else {
      // Store a clone of the em/strong states
	  var saved_states = $.extend(true, {}, tag_states);

      s.unshift(md);

      //D:this.debug_indent += "  ";

      // Recurse
      var res = this.processInline( text.substr( md.length ) );
      //D:this.debug_indent = this.debug_indent.substr(2);

      var last = res[res.length - 1];

      //D:this.debug("processInline from", tag + ": ", uneval( res ) );

      var check = s.shift();
      if ( last instanceof CloseTag ) {
        res.pop();
        // We matched! Huzzah.
        var consumed = text.length - last.len_after;
        return [ consumed, [ tag ].concat(res) ];
      }
      else {
        // Restore the state of the other kind. We might have mistakenly closed it.
        tag_states = saved_states;

        // We can't reuse the processed result as it could have wrong parsing contexts in it.
        return [ md.length, md ];
      }
    }
  }; // End returned function
}

var tag_states ={};
tag_states.em = [];
tag_states.strong = [];
tag_states.u = [];
tag_states.sup = [];
tag_states.del = [];
tag_states.sub = [];
tag_states.mark = [];


Markdown.dialects.Tiddly.inline["**"] = strong_em("strong", "**");
Markdown.dialects.Tiddly.inline["*"] = strong_em("strong", "*");
Markdown.dialects.Tiddly.inline["//"] = strong_em("em", "//");
Markdown.dialects.Tiddly.inline["__"] = strong_em("u", "__");
Markdown.dialects.Tiddly.inline["@@"] = strong_em("mark", "@@");
Markdown.dialects.Tiddly.inline["^^"] = strong_em("sup", "^^");
Markdown.dialects.Tiddly.inline["~~"] = strong_em("del", "~~");
Markdown.dialects.Tiddly.inline[",,"] = strong_em("sub", ",,");

function Tiddly_buildInlinePatterns(d) {
  var patterns = [];

  for ( var i in d ) {
    // __foo__ is reserved and not a pattern
    if ( i.match( /^__.*__$/) ) continue;
    var l = i.replace( /([\\^.*+?|()\[\]{}])/g, "\\$1" )
             .replace( /\n/, "\\n" );
    patterns.push( i.length == 1 ? l : "(?:" + l + ")" );
  }

  patterns = patterns.join("|");
  d.__patterns__ = patterns;
  //print("patterns:", uneval( patterns ) );

  var fn = d.__call__;
  d.__call__ = function(text, pattern) {
    if ( pattern != undefined ) {
      return fn.call(this, text, pattern);
    }
    else
    {
      return fn.call(this, text, patterns);
    }
  };
};

Markdown.buildBlockOrder ( Markdown.dialects.Tiddly.block );
//Markdown.buildInlinePatterns( Markdown.dialects.Tiddly.inline );
Tiddly_buildInlinePatterns( Markdown.dialects.Tiddly.inline );
};

var print = function () {
  console.debug.apply( console, arguments );
};
