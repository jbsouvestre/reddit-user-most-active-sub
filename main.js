/*jshint jquery: true*/

(function() {
    'use strict';

    var slice = Array.prototype.slice;

    var
        NUMBER_OF_REQUESTS = 5,
        COMMENT_SORTINGS = {
            HOT: 'hot',
            NEW: 'new',
            TOP: 'top',
            CONTROVERSIAL: 'controversial'
        },
        COMMENT_SORTING = COMMENT_SORTINGS.TOP;

    var utils = {
        format: function(string /*, args... */ ) {
            var args = slice.call(arguments, 1);
            var i = 0;
            return string.replace(/\{\}/g, function() {
                return args[i++];
            });
        }
    };

    var _getSubredditFromComments = function(comments) {
        var subreddits = {},
            max;

        comments.forEach(function(comment) {
            var sub = comment.data.subreddit;

            if (!max) {
                max = sub;
            }

            if (subreddits[sub]) {
                subreddits[sub]++;
                if (subreddits[sub] > subreddits[max]) {
                    max = sub;
                }
            } else {
                subreddits[sub] = 1;
            }
        });

        return {
            subreddits: subreddits,
            max: max
        };
    };

    var getComment = function(url, after) {
        return $.get(url, {
            data: {
                after: after
            }
        });
    };



    var getMostActiveSubreddit = function(author) {
        var url = utils.format('/user/{}/comments.json', author);
        var def = $.Deferred();

        var after = null,
            i = 0;

        $.get(url).then(function(response) {
            var comments = response.data.children;

            def.resolve(_getSubredditFromComments(comments));
        });

        return def.promise();
    };

    var drawTooltip = function($author) {

        return function(subredditData) {
            var mostActiveSub = subredditData.max;
            var tooltipText = mostActiveSub ? utils.format('/r/{}', mostActiveSub) : 'No Data';

            var tooltip = $('<span>');
            tooltip
                .text(tooltipText)
                .css({
                    'border': '1px solid #ccc',
                    'background': '#eee',
                    'border-radius': '2px'
                })
                .attr({
                    title: utils.format('User comments the most in : {}', tooltipText)
                });

            tooltip.insertAfter($author);
        };
    };

    $(function() {

        var thingSelector = '.entry',
            authorSelector = '.author';

        var _clickCallback = function() {
            var $author = $(authorSelector, $(this));
            var author = $author.text();

            getMostActiveSubreddit(author).then(drawTooltip($author));
        };

        $(thingSelector).one('click', _clickCallback);
    });
})();