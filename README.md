
# Small2 Drag

> 

## How To Use

```
<style> ... </style>

<body>
    <div id="drag-box">
        <div id="drag-target"></div>
    </div>

    <script src="drag-0.1.js"></script>
    
    <script>
        var dragBox = document.getElementsByClassName("drag-box")[0];
        var dragTarget = dragBox.getElementsByClassName("drag-target")[0];
        new Drag(dragBox, dragTarget).startDrag();
    </script>
</body>
```

## Example


(!Example)[https://segmentfault.com/img/bVyuek]

