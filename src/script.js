var cy = (window.cy = cytoscape({
    container: document.getElementById("cy"),
    layout: {
      name: "dagre"
    }, // end layout
    style: [
      {
        selector: "node",
        style: {
          "shape": 'rectangle',
          "width": 200,
          "text-max-width": 200,
          "height": 75,
          // "content": "data(name)",
          "content": function (node) { 
            console.log(node)
            return node.data('project_name') + "\n" + node.data('phase_name') + "\n" + node.data('date')
          },
          "text-margin-x": 0,
          "text-wrap": "wrap",
          "text-halign": "center",
          "text-valign": "center",
          "background-color": "#AED6F1"
        }
      },
      {
        selector: "edge",
        style: {
          width: 1,
          "target-arrow-shape": "triangle",
          "line-color": "#9dbaea",
          "target-arrow-color": "#9dbaea",
          // "curve-style": "bezier"
          "curve-style": "taxi"
          // "curve-style": "segments"
        }
      }
    ], // end style
    elements: {
    nodes: [
      {
        data: { id: 'a', project_name: 'pFoo', phase_name: 'foo', date: '11-29-2023'}
      },
      {
        data: { id: 'b', project_name: 'pBar',phase_name: 'bar', date: '10-04-2023'}
      },
      {
        data: { id: 'c', project_name: 'pCharlie',phase_name: 'charlie', date: '9-1-2022'}
      },
      {
        data: { id: 'd', project_name: 'pDelta',phase_name: 'delta', date: '6-27-2022' }
      },
      {
        data: { id: 'e', project_name: 'pEcho', phase_name: 'echo', date: '7-03-2021' }
      },
    ],
    edges: [
      {
        data: { id: 'ab', source: 'a', target: 'b', description: "Dependency Description goes here" }
      },
      {
        data: { id: 'ac', source: 'a', target: 'c', description: "Dependency Description goes here" }
      },
      {
        data: { id: 'ad', source: 'a', target: 'd', description: "Dependency Description goes here" }
      },
      {
        data: { id: 'de', source: 'd', target: 'e', description: "Dependency Description goes here" }
      },
    ]
  },
  }));
  cy
    .elements()
    .layout({
      name: "dagre",
      
      nodeSep: 100, // the separation between adjacent nodes in the same rank
      edgeSep: undefined, // the separation between adjacent edges in the same rank
      rankSep: 120, // the separation between each rank in the layout
      rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
      fit: false,
      ready: () => {
        cy.zoom(1);
        cy.center(cy.getElementById("a"));
      }
    }) // end layout
    .run();
  cy.on("tap", "node", function tapNode(e) {
    console.log("tap node")
    // const node = e.target;
    // node
    //   .connectedEdges()
    //   .targets()
    //   .style("visibility", "hidden");
  });
  cy.on("zoom", e => {
    // console.log(cy.zoom());
  }); // end zoom

  function makePopperNode(ele) {
    let ref = ele.popperRef();
    ele.tippy = tippy(document.createElement('div'), {
      // popperInstance will be available onCreate
      lazy: false,
      followCursor: 'true',
      theme: 'translucent',
      hideOnClick: false,
      flipOnUpdate: true,
      onShow(instance) {
        instance.popperInstance.reference = ref
      },
    });
    ele.tippy.setContent('Node ' + ele.id());
  }

  function makePopperEdge(ele) {
    let ref = ele.popperRef();
    ele.tippy = tippy(document.createElement('div'), {
      // popperInstance will be available onCreate
      lazy: false,
      // theme: 'light',
      theme: 'translucent',
      followCursor: 'true',
      hideOnClick: false,
      flipOnUpdate: true,
      onShow(instance) {
        instance.popperInstance.reference = ref
      },
    });
    // ele.tippy.setContent('Edge ' + ele.id());
    ele.tippy.setContent(ele.data('description'));
  }

  cy.ready(function() {
    // Make all the popper objects on init.
    // If there's a lot of elements we probably want to make the popper dynamically on hover
    // according to the popper/tippy docs.
    // Drawing large number of tooltips can cause performance issues
    cy.nodes().forEach(function(ele) {
      makePopperNode(ele);
      // ele.tippy.show()
    });
    cy.edges().forEach(function(ele) {
      makePopperEdge(ele);
      // ele.tippy.show()
    });
  });

  function updateTippyElement(event) {
    event.target.tippy.popperInstance.update()
  }

  function updateTippyNeighborhood(event) {
    // when we move a node we also have to update the edge label 
    event.target.closedNeighborhood().forEach(function(ele) {
      ele.tippy.popperInstance.update()                
    })
  }

  function updateTippyNodes(event) {
    // updaet all nodes
    cy.nodes().forEach(function(ele) {
      ele.tippy.popperInstance.update()          
    })
  }

  function updateTippyEdges(event) {
    // update all edges
    cy.edges().forEach(function(ele) {
      ele.tippy.popperInstance.update()          
    })
  }

  function updateTippyElements(event) {
    // update all elements
    cy.elements().forEach(function(ele) {
      ele.tippy.popperInstance.update()          
    })
  }

// if we don't show the popper on load we might want to show it on hover
  cy.elements().unbind('mouseover');
  cy.elements().bind('mouseover', (event) => event.target.tippy.show());

  cy.elements().unbind('mouseout');
  cy.elements().bind('mouseout', (event) => event.target.tippy.hide());

  cy.edges().unbind('mouseover');
  cy.edges().bind('mouseover', (event) => event.target.tippy.show());

  cy.edges().unbind('mouseout');
  cy.edges().bind('mouseout', (event) => event.target.tippy.hide());


  // cy.elements().unbind('drag');
  // cy.elements().bind('drag', (event) => event.target.tippy.popperInstance.update());
  
  cy.elements().unbind('drag');
  cy.elements().bind('drag', (event) => updateTippyNeighborhood(event));

  // Some canvas events require updating all tippys
  cy.unbind('zoom pan');
  cy.bind('zoom pan', (event) => updateTippyElements(event));


//   cy.elements().unbind('resize');
//   cy.elements().bind('resize', (event) => event.target.tippy.popperInstance.update());

//   cy.elements().unbind('zoom');
//   cy.elements().bind('zoom', (event) => event.target.tippy.popperInstance.update());

