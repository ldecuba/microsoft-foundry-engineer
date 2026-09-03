param(
  [Parameter(Mandatory = $true)]
  [string] $ImageName
)

docker build -t $ImageName .
