import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const Input = styled('input')({
  display: 'none',
})

export interface HerbariumAppBarProps {
  // onExport: (event: any) => Promise<void>
  onImport: (event: any) => Promise<void>
}

export default function HerbariumAppBar(props: HerbariumAppBarProps) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Herbarium
          </Typography>
          <Button color="inherit">Export</Button>
          <label htmlFor="contained-button-file">
            <Input
              accept="image/*"
              id="contained-button-file"
              multiple
              type="file"
              onChange={props.onImport}
            />
            <Button component="span" color="inherit">
              Import
            </Button>
          </label>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
