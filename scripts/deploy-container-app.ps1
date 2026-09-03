param(
  [Parameter(Mandatory = $true)]
  [string] $ResourceGroup,

  [Parameter(Mandatory = $true)]
  [string] $Image,

  [Parameter(Mandatory = $true)]
  [string] $McpApiKey,

  [string] $Location = "westeurope",
  [string] $AppName = "microsoft-foundry-engineer-mcp"
)

az group create --name $ResourceGroup --location $Location

az deployment group create `
  --resource-group $ResourceGroup `
  --template-file infra/container-app.bicep `
  --parameters appName=$AppName image=$Image mcpApiKey=$McpApiKey location=$Location
