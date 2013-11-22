/*!
 * EIC Summarizer
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['eic-gui-master/client/scripts/lib/jquery', 'eic-gui-master/client/scripts/eic/Logger', 'eic-gui-master/client/scripts/config/URLs'], function ($, Logger, urls) {
  "use strict";
  var logger = new Logger("Summarizer");

  var maxSentences = 1;

  /*
   * CLEANUP
   **/

  function Summarizer() {
    this.result = {
      topics : [],
      links : []
    };
  }

  Summarizer.prototype = {
    summarize : function (data) {

      logger.log('Started summarization');

      var path = data.path;
      var self = this;

      /**
       * Generate the result formatted as the 'test' .json
       */
      function formatResult(result, vertices) {			
        for (var i = 1; i < result.topics.length; i++) {
          var glue = '';
          var sentence = result.links[i - 1][Math.round(Math.random())];
          switch (sentence.type) {
          case 'direct':
            glue = result.topics[i - 1].topic.label + sentence.value + result.topics[i].topic.label + '. ';
            break;
          case 'indirect':
            glue = result.topics[i].topic.label + sentence.value + result.topics[i - 1].topic.label + '. ';
            break;
          }
          result.topics[i].topic.previous =  result.topics[i - 1].topic.label;
          result.topics[i].hash_object.defaultText = glue + result.topics[i].hash_object.defaultText;
          if (!result.topics[i].hash_object.audio_text)
			result.topics[i].hash_object.audio_text=result.topics[i].hash_object.defaultText;
		  //updating the hash object
		  //vertices[i].audio_text = result.topics[i].text;
        }
        
        //to handle the first node
		if (!result.topics[0].hash_object.audio_text)
		  result.topics[0].hash_object.audio_text=result.topics[0].hash_object.defaultText;
		//vertices[0].audio_text = result.topics[0].text;
		
        return {
          steps: result.topics
        };
      }

      function retrieveTranscriptions(edges) {

        function retrieveTranscription(index, edge) {
          var  property = edge.uri.substr(edge.uri.lastIndexOf('/') + 1);
          logger.log('Extracting sentence for', edge.uri);
          //Split the string with caps
          var parts = property.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);

          if (parts[0] === 'has' || parts[0] === 'is') {
            parts.shift();
          }

          var sentence = [
            {
              type: 'indirect',
              value: edge.inverse ? '\'s ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' is ' : '\'s the ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' of '
            },
            {
              type: 'direct',
              value: edge.inverse ? '\'s the ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' of ' : '\'s ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' is '
            }
          ];

          self.result.links[index] = sentence;

          if ((self.result.topics.length + self.result.links.length) === path.length) {
            $(self).trigger('generated', formatResult(self.result));
          }

          logger.log('Property', property);
          logger.log('Generated sentence', index, ':', self.result.links[index][0].value);
        }

        $(edges).each(retrieveTranscription);
      }

      function retrieveAbstracts(vertices) {	  
		  
        var uri = vertices.map(function (vertice) { return vertice.uri; });
        $.ajax({
          url: urls.abstracts,
          dataType: 'json',
          data: {
            uri: uri.join(',')
          },
          success: function (abstracts) {
            if (abstracts.length === 0)
              logger.log('No abstracts found');

            function retrieveAbstract(index, vertice) {
              var uri = vertice.uri || '';
              var tregex = /\n|([^\r\n.!?]+([.!?]+|$))/gim;

              function getLabel(item) {
                if (item.label)
                  return item.label;

                var label = uri.substr(uri.lastIndexOf('/') + 1);

                return label.replace(/[^A-Za-z0-9]/g, ' ');
              }

              function getDescription(item) {
                var abstract = item.abstract || '';
                var sentences = abstract.match(tregex) || [];
                var desc = sentences.slice(0, maxSentences).join(' ');
                return desc;
              }

              var item = abstracts[uri] || {},
                  desc = getDescription(item);
                  
              vertice.defaultText = desc;
              
              self.result.topics[index] = {
                topic : {
                  type: item.type || '',
                  label: getLabel(item)
                },
                hash_object: vertice
                //defaultText : desc,
                //text: vertice.audio_text,
                //slide_description: vertice.slide_description
              };

              if ((self.result.topics.length + self.result.links.length) === path.length) {
                $(self).trigger('generated', formatResult(self.result, vertices));
              }
			  logger.log('created', self.result.topics[index]);
              logger.log('Resource', vertice);
              logger.log('Extracted text', desc);
            }

            $(vertices).each(retrieveAbstract);
          },
          error: function (err) {
            logger.log('Error retrieving abstracts', err);
          }
        });
      }

      retrieveTranscriptions(path.filter(function (o) { return o.type === 'link'; }));
      retrieveAbstracts(path.filter(function (o) { return o.type === 'node';  }));
    }
  };
  return Summarizer;
});


